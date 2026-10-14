import { describe, expect, it } from 'vitest';
import {
  estimateLessonText,
  lessonTextItems,
  lessonTextProblems,
  lessonTextSpec,
  type LessonSourceItem,
} from './text';

const items: LessonSourceItem[] = [
  { id: 'k001', type: 'definition', content: { concept: 'Rasional ədəd' }, pages: [9] },
  { id: 'k002', type: 'exercise', content: { number: '1' }, pages: [10] },
  { id: 'k003', type: 'formula', content: { latex: '|a| = |-a|' }, pages: [11] },
];
const topic = { bookId: 'b7', number: '1.1', title: 'Rasional ədədlər', unit: 'Rasional ədədlər' };

describe('lessonTextSpec', () => {
  it('sends the approved items the text is written from, not the exercises', () => {
    const spec = lessonTextSpec(topic, items);
    const text = spec.content[0]?.type === 'text' ? spec.content[0].text : '';
    expect(text).toContain('TOPIC 1.1. Rasional ədədlər');
    expect(text).toContain('"id":"k001"');
    expect(text).toContain('"pages":[11]');
    expect(text).not.toContain('k002');
    expect(spec).toMatchObject({
      stage: 'lesson_text',
      model: 'claude-opus-5-5',
      effort: 'medium',
    });
    expect(lessonTextItems(items).map((i) => i.id)).toEqual(['k001', 'k003']);
  });

  it('estimates the cost before calling', () => {
    const estimate = estimateLessonText(lessonTextSpec(topic, items));
    expect(estimate.inputTokens).toBeGreaterThan(100);
    expect(estimate.costUsd).toBeGreaterThan(0.1);
  });
});

describe('lessonTextProblems', () => {
  const paragraph = (text: string, sources: string[]) => ({
    sections: [{ heading: 'Modul', paragraphs: [{ text, sources }] }],
  });

  it('accepts text citing approved items with math between dollar signs', () => {
    expect(lessonTextProblems(paragraph('Əks ədədlər: $|a| = |-a|$.', ['k003']), items)).toEqual(
      [],
    );
  });

  it('rejects unknown or exercise sources and LaTeX outside dollar signs', () => {
    expect(lessonTextProblems(paragraph('Bax \\frac{1}{2}.', ['k002', 'k009']), items)).toEqual([
      'section 1, paragraph 1: unknown source k002',
      'section 1, paragraph 1: unknown source k009',
      'section 1, paragraph 1: LaTeX outside $…$',
    ]);
  });
});
