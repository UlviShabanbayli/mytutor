import { z } from 'zod';
import { lessonSectionSchema } from '@mytutor/schemas';
import type { KnowledgeItem } from '@mytutor/types';
import type { CallSpec } from '../knowledge/claude';
import { estimateTokens } from '../knowledge/estimate';
import { costUsd } from '../knowledge/pricing';
import { LESSON_TEXT_PROMPT_VERSION, LESSON_TEXT_SYSTEM } from './prompt';

export const LESSON_TEXT_MODEL = 'claude-opus-5-5';

/** What the model returns: the sections of the lesson text, each paragraph with its sources. */
export const lessonTextOutputSchema = z.object({ sections: z.array(lessonSectionSchema).min(1) });
export type LessonTextOutput = z.output<typeof lessonTextOutputSchema>;

/** Item types the lesson text is written from; exercises stay below the text, as in the book. */
const TEXT_TYPES = new Set<KnowledgeItem['type']>([
  'definition',
  'rule',
  'formula',
  'worked_example',
  'term',
  'figure',
  'question',
  'prerequisite',
]);

export type LessonTopic = { bookId: string; number: string; title: string; unit: string };

/** An approved item as the lesson prompt sees it: its corrected content and printed pages. */
export type LessonSourceItem = Pick<KnowledgeItem, 'id' | 'type' | 'content'> & {
  pages: number[];
};

export const lessonTextItems = (items: LessonSourceItem[]) =>
  items.filter((item) => TEXT_TYPES.has(item.type));

/** The call that writes one topic's lesson text from its approved items. */
export function lessonTextSpec(
  topic: LessonTopic,
  items: LessonSourceItem[],
): CallSpec<typeof lessonTextOutputSchema> {
  const used = lessonTextItems(items);
  const text = [
    `TOPIC ${topic.number}. ${topic.title}`,
    `UNIT ${topic.unit}`,
    'APPROVED ITEMS',
    ...used.map((item) =>
      JSON.stringify({ id: item.id, type: item.type, pages: item.pages, content: item.content }),
    ),
  ].join('\n');
  return {
    id: `lesson-text:${topic.bookId}:${topic.number}`,
    stage: 'lesson_text',
    model: LESSON_TEXT_MODEL,
    effort: 'medium',
    promptVersion: LESSON_TEXT_PROMPT_VERSION,
    system: LESSON_TEXT_SYSTEM,
    content: [{ type: 'text', text }],
    schema: lessonTextOutputSchema,
    blockIds: [],
  };
}

/** Output tokens a lesson text takes, thinking included: a generous guess for the estimate. */
const OUTPUT_TOKENS_GUESS = 8000;

/** What writing the text would cost, before any call. */
export function estimateLessonText(spec: CallSpec<typeof lessonTextOutputSchema>) {
  const inputTokens = estimateTokens(spec.content, spec.system);
  return {
    inputTokens,
    costUsd: costUsd(spec.model, {
      input: inputTokens,
      output: OUTPUT_TOKENS_GUESS,
      cacheWrite: 0,
      cacheRead: 0,
    }),
    model: spec.model,
  };
}

/**
 * Problems that make an answer unusable: a source that is not one of the approved items the
 * model was given, or LaTeX outside dollar signs (it would show as raw commands).
 */
export function lessonTextProblems(output: LessonTextOutput, items: LessonSourceItem[]): string[] {
  const known = new Set(lessonTextItems(items).map((item) => item.id));
  const problems: string[] = [];
  output.sections.forEach((section, s) =>
    section.paragraphs.forEach((paragraph, p) => {
      const where = `section ${s + 1}, paragraph ${p + 1}`;
      for (const id of paragraph.sources)
        if (!known.has(id)) problems.push(`${where}: unknown source ${id}`);
      const outside = paragraph.text.split(/\$[^$]*\$/).join('');
      if (/\\[a-zA-Z]+/.test(outside)) problems.push(`${where}: LaTeX outside $…$`);
    }),
  );
  return problems;
}
