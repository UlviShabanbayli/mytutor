import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod';
import {
  callClaude,
  createClient,
  estimateLessonText,
  LESSON_TEXT_PROMPT_VERSION,
  lessonTextItems,
  lessonTextProblems,
  lessonTextSpec,
  type LessonSourceItem,
} from '@mytutor/content-engine';
import {
  effectiveContent,
  itemDecisions,
  itemFingerprint,
  knowledgeDocumentSchema,
  topicLessonSchema,
  topicReviewSchema,
} from '@mytutor/schemas';
import type { LessonTextEstimate, TopicLesson } from '@mytutor/types';
import { lessonFile, readCurriculum, scanBooks } from './contentIndex';
import { writeJson } from './json';
import { exclusive, PipelineError } from './pipeline';
import { REVIEW_FILE } from './topicStatus';

/** The parts of a topic's source.json a lesson needs. */
const sourceHead = z.object({
  topic: z.object({ title: z.string(), unit: z.object({ title: z.string() }) }),
});

export type LessonRef = { root: string; curriculumId: string; bookId: string; number: string };

const readJsonFile = async (path: string) => JSON.parse(await readFile(path, 'utf8')) as unknown;

async function readLesson(ref: LessonRef): Promise<TopicLesson | null> {
  try {
    return topicLessonSchema.parse(await readJsonFile(lessonFile(ref.root, ref)));
  } catch {
    return null;
  }
}

/** `lesson_` and ten random lower-case letters or digits. */
const newLessonId = () =>
  `lesson_${[...randomBytes(10)].map((b) => (b % 36).toString(36)).join('')}`;

const pagesOf = (sources: { regions: { page: number; printedPage: number | null }[] }[]) =>
  [...new Set(sources.flatMap((s) => s.regions.map((r) => r.printedPage ?? r.page)))].sort(
    (a, b) => a - b,
  );

/** The topic behind a lesson and its approved knowledge items, as the lesson prompt sees them. */
async function lessonInput(ref: LessonRef) {
  const { root, curriculumId, bookId, number } = ref;
  const curriculum = await readCurriculum(root, curriculumId);
  if (!curriculum) throw new PipelineError(404, 'no_curriculum', 'No such curriculum');
  if (!curriculum.textbooks.some((t) => t.bookId === bookId))
    throw new PipelineError(404, 'no_book', 'The book is not in this curriculum');
  const book = (await scanBooks(root)).find((b) => b.id === bookId);
  if (!book) throw new PipelineError(404, 'no_book', 'Unknown book');
  const entry = book.topics.find((t) => t.number === number);
  if (!entry) throw new PipelineError(404, 'no_topic', 'Unknown topic');
  if (!entry.knowledge || !entry.source)
    throw new PipelineError(409, 'no_knowledge', 'The topic has no knowledge document');

  const doc = knowledgeDocumentSchema.parse(await readJsonFile(join(root, entry.knowledge)));
  const source = sourceHead.parse(await readJsonFile(join(root, entry.source)));
  const review = await readJsonFile(join(root, entry.dir, REVIEW_FILE)).then(
    (data) => topicReviewSchema.parse(data),
    () => null,
  );
  const decisions = itemDecisions(doc.items, review);
  const items = doc.items.flatMap((item) => {
    const decision = decisions.get(item.id);
    if (decision?.decision !== 'approved') return [];
    const used: LessonSourceItem & { fingerprint: string } = {
      id: item.id,
      type: item.type,
      content: effectiveContent(item, decision),
      pages: pagesOf(item.sources),
      fingerprint: itemFingerprint(item),
    };
    return [used];
  });
  if (!lessonTextItems(items).length)
    throw new PipelineError(409, 'no_approved_items', 'The topic has no approved items');
  const topic = { bookId, number, title: source.topic.title, unit: source.topic.unit.title };
  return { topic, items, spec: lessonTextSpec(topic, items) };
}

/** What writing the lesson text would cost; no API call. */
export async function estimateLessonTextCost(ref: LessonRef): Promise<LessonTextEstimate> {
  const { items, spec } = await lessonInput(ref);
  return { items: lessonTextItems(items).length, ...estimateLessonText(spec) };
}

export type WriteLessonTextInput = LessonRef & {
  client?: ReturnType<typeof createClient>;
  now?: () => Date;
};

/**
 * Writes a new draft of the lesson text with Claude: always a fresh answer, checked (every
 * source an approved item, no stray LaTeX) before it is saved. The approved text stays as it
 * is until the draft is approved.
 */
export async function writeLessonText({
  client = createClient(),
  now = () => new Date(),
  ...ref
}: WriteLessonTextInput) {
  const key = `lesson:${ref.curriculumId}:${ref.bookId}:${ref.number}`;
  return exclusive(key, async () => {
    const { topic, items, spec } = await lessonInput(ref);
    if (!client)
      throw new PipelineError(503, 'no_api_key', 'ANTHROPIC_API_KEY is not set in the repo .env');
    const cacheDir = join(ref.root, '.ai-cache', 'lesson-text');
    let answer;
    try {
      answer = await callClaude(client, spec, cacheDir, { reuse: false });
    } catch (error) {
      throw new PipelineError(502, 'ai_failed', error instanceof Error ? error.message : 'AI');
    }
    const problems = lessonTextProblems(answer.output, items);
    if (problems.length) throw new PipelineError(502, 'ai_failed', problems.join('; '));
    const used = new Set(
      answer.output.sections.flatMap((s) => s.paragraphs.flatMap((p) => p.sources)),
    );
    const at = now().toISOString();
    const current = await readLesson(ref);
    const lesson: TopicLesson = {
      schemaVersion: 1,
      id: current?.id ?? newLessonId(),
      topic: { bookId: topic.bookId, number: topic.number },
      text: current?.text ?? null,
      draft: {
        sections: answer.output.sections,
        itemFingerprints: Object.fromEntries(
          items.filter((i) => used.has(i.id)).map((i) => [i.id, i.fingerprint]),
        ),
        model: answer.call.model,
        promptVersion: LESSON_TEXT_PROMPT_VERSION,
        costUsd: answer.call.costUsd,
        createdAt: at,
        approvedAt: null,
      },
      createdAt: current?.createdAt ?? at,
      updatedAt: at,
    };
    await writeJson(lessonFile(ref.root, ref), lesson);
    return { updatedAt: at, costUsd: answer.call.costUsd };
  });
}

/** Approves the draft: it becomes the text students read. Or drops it (`approve: false`). */
export async function decideLessonDraft({
  approve,
  now = () => new Date(),
  ...ref
}: LessonRef & { approve: boolean; now?: () => Date }) {
  const key = `lesson:${ref.curriculumId}:${ref.bookId}:${ref.number}`;
  return exclusive(key, async () => {
    const lesson = await readLesson(ref);
    if (!lesson?.draft) throw new PipelineError(409, 'no_draft', 'The lesson has no draft');
    const at = now().toISOString();
    const next: TopicLesson = {
      ...lesson,
      text: approve ? { ...lesson.draft, approvedAt: at } : lesson.text,
      draft: null,
      updatedAt: at,
    };
    await writeJson(lessonFile(ref.root, ref), next);
    return { updatedAt: at };
  });
}
