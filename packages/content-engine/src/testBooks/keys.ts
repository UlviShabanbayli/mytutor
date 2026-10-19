import { z } from 'zod';
import type { AiCall, QuestionTopicLink, TestQuestion, TopicCatalogue } from '@mytutor/types';
import { callClaude, type CallSpec } from '../knowledge/claude';
import { TEST_KEYS_SYSTEM, TEST_KEYS_VERSION } from './prompts';

export const TEST_KEYS_MODEL = 'claude-opus-5-5';
/** Questions per call: one subsection at a time, split when it is long. */
const BATCH = 20;

/** The answer's schema: topic codes are an enum, so only listed topics can be named. */
export function keysSchema(catalogue: TopicCatalogue) {
  const codes = catalogue.topics.map((t) => t.code) as [string, ...string[]];
  return z.object({
    questions: z.array(
      z.object({
        id: z.string(),
        links: z.array(
          z.object({
            topic: z.enum(codes),
            role: z.enum(['required', 'related']),
            confidence: z.number(),
            reason: z.string(),
          }),
        ),
        uncovered: z.string(),
      }),
    ),
  });
}

/** The topic list as Claude reads it, once per call and cached with the system prompt. */
export function catalogueText(catalogue: TopicCatalogue): string {
  const books = catalogue.books.map((b) => `${b.code} = ${b.title}`).join('\n');
  const topics = catalogue.topics.map((t) => {
    const head = `${t.code} · ${t.grade ?? '?'}-ci sinif · «${t.unit}» · ${t.title}`;
    const note = t.knowledge === 'approved' ? '' : ' (no approved knowledge)';
    return [`${head}${note}`, ...t.teaches.map((line) => `  - ${line}`)].join('\n');
  });
  return `${books}\n\n${topics.join('\n')}`;
}

/** A question as text: its section, stem, options or items, and whether it has a figure. */
const questionText = (q: TestQuestion) =>
  [
    `QUESTION ${q.id} (${q.section} / ${q.subsection}, № ${q.number}, ${q.type})`,
    q.situation ? `Situation: ${q.situation.text}` : '',
    q.stem,
    ...q.options.map((o) => `${o.key}) ${o.text}`),
    ...(q.matching?.left ?? []).map((o) => `${o.key}. ${o.text}`),
    ...(q.matching?.right ?? []).map((o) => `${o.key}. ${o.text}`),
    q.figures.length ? '[the question has a figure]' : '',
  ]
    .filter(Boolean)
    .join('\n');

export function keysSpec(catalogue: TopicCatalogue, questions: TestQuestion[]) {
  const schema = keysSchema(catalogue);
  const spec: CallSpec<typeof schema> = {
    id: `test-keys:${questions[0]?.id ?? ''}`,
    stage: 'test_keys',
    model: TEST_KEYS_MODEL,
    effort: 'medium',
    promptVersion: TEST_KEYS_VERSION,
    system: `${TEST_KEYS_SYSTEM}${catalogueText(catalogue)}`,
    content: [{ type: 'text', text: questions.map(questionText).join('\n\n') }],
    schema,
    blockIds: [],
  };
  return spec;
}

/** Questions in batches: one subsection at a time, at most BATCH in a call. */
export function batches(questions: TestQuestion[]): TestQuestion[][] {
  const out: TestQuestion[][] = [];
  for (const q of questions) {
    const last = out.at(-1);
    if (last && last.length < BATCH && last[0]?.subsection === q.subsection) last.push(q);
    else out.push([q]);
  }
  return out;
}

/**
 * Links each question to the topics it needs, as suggestions; a link an editor confirmed or
 * rejected before is kept as it was.
 */
export async function keyQuestions(
  catalogue: TopicCatalogue,
  questions: TestQuestion[],
  client: Parameters<typeof callClaude>[0],
  cacheDir: string,
  {
    concurrency = 3,
    onBatch,
  }: { concurrency?: number; onBatch?: (done: number, total: number) => void } = {},
): Promise<AiCall[]> {
  const byCode = new Map(catalogue.topics.map((t) => [t.code, t]));
  const queue = batches(questions);
  const total = queue.length;
  const calls: AiCall[] = [];
  let done = 0;
  const worker = async () => {
    for (let batch = queue.shift(); batch; batch = queue.shift()) {
      const answer = await callClaude(client, keysSpec(catalogue, batch), cacheDir);
      calls.push(answer.call);
      const found = new Map(answer.output.questions.map((q) => [q.id, q]));
      for (const question of batch) {
        const keyed = found.get(question.id);
        if (!keyed) {
          question.flags = [...question.flags.filter((f) => f !== 'not_keyed'), 'not_keyed'];
          continue;
        }
        const decided = question.links.filter((l) => l.status !== 'suggested');
        const suggested: QuestionTopicLink[] = keyed.links.flatMap((link) => {
          const topic = byCode.get(link.topic);
          if (!topic || decided.some((d) => d.bookId === topic.bookId && d.number === topic.number))
            return [];
          return [
            {
              bookId: topic.bookId,
              number: topic.number,
              role: link.role,
              status: 'suggested' as const,
              confidence: Math.min(1, Math.max(0, link.confidence)),
              reason: link.reason,
            },
          ];
        });
        question.links = [...decided, ...suggested];
        question.uncovered = keyed.uncovered.trim() || null;
        question.flags = question.flags.filter((f) => f !== 'not_keyed');
      }
      onBatch?.(++done, total);
    }
  };
  // The first call writes the topic list to the prompt cache; the others then read it.
  const first = queue.splice(0, 1);
  const rest = queue.splice(0);
  queue.push(...first);
  await worker();
  queue.push(...rest);
  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, worker));
  return calls;
}
