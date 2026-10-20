import { answerDemo } from '@mytutor/demo-data';
import { studyLessonSchema } from '@mytutor/schemas';
import type { BookAnswers, BookLesson } from '@mytutor/types';
import { lessonView } from './lessonView';

const NOW = new Date('2026-10-20T06:00:00.000Z');
const demo = studyLessonSchema.parse(
  answerDemo('/v1/lessons/riyaziyyat-7-4-3', { persona: 'nermin', now: NOW }).body,
);

// Made-up stand-ins for the local content folder (never book text in the repository).
const book: BookLesson = {
  topicId: 'riyaziyyat-7-4-3',
  number: '4.3',
  book: 'Riyaziyyat 7 (TRİMS), 1-ci hissə',
  sections: [{ heading: null, paragraphs: ['Nümunə: $a^{3}$.'] }],
  approvedAt: '2026-10-01T00:00:00.000Z',
};
const answers: BookAnswers = {
  topicId: 'riyaziyyat-7-4-3',
  number: '4.3',
  book: 'Riyaziyyat 7 (TRİMS), 1-ci hissə',
  pages: { start: 90, end: 95 },
  answers: [
    {
      id: 'a1',
      page: 92,
      exercise: '3',
      section: null,
      parts: [
        { label: 'a', text: '8', latex: null },
        { label: 'b', text: '27', latex: null },
      ],
      sourcePage: 200,
      sourcePrintedPage: 198,
      status: 'verified',
      correction: null,
    },
    {
      id: 'a2',
      page: 93,
      exercise: '4',
      section: null,
      parts: [{ label: null, text: '?', latex: null }],
      sourcePage: 200,
      sourcePrintedPage: 198,
      status: 'mismatch',
      correction: null,
    },
  ],
};
const topic = {
  id: 'riyaziyyat-7-4-3',
  number: '4.3',
  shortTitle: 'Cəmin və fərqin kubu',
  pages: { start: 90, end: 95 },
};

describe('lessonView', () => {
  it('is the demo lesson with all four steps when there is no book content', () => {
    const view = lessonView({ demo, book: null, answers: null, topic: null, testId: 'x' });
    expect(view?.steps).toEqual(['video', 'text', 'example', 'exercise']);
    expect(view?.fromBook).toBe(false);
    expect(view?.textSource).toBe(demo.source);
    expect(view?.testId).toBe('test-riyaziyyat-7-4-3');
    expect(view?.bookAnswers).toBeNull();
  });

  it("takes the book's text and answers first and keeps the demo's other steps", () => {
    const view = lessonView({ demo, book, answers, topic, testId: 'x' });
    expect(view?.steps).toEqual(['video', 'text', 'example', 'exercise']);
    expect(view?.fromBook).toBe(true);
    expect(view?.pages[0]?.heading).toBe('Cəmin və fərqin kubu');
    expect(view?.pages[0]?.paragraphs).toEqual(['Nümunə: a³.']);
    expect(view?.textSource).toBe('Riyaziyyat 7 (TRİMS), 1-ci hissə · 4.3 (s. 90–95)');
    expect(view?.bookAnswers?.items).toEqual([
      { id: 'a1', exercise: '3', page: 92, text: 'a) 8; b) 27' },
    ]);
  });

  it('is the book text alone for a topic without a demo lesson', () => {
    const view = lessonView({ demo: null, book, answers: null, topic, testId: 'test-t' });
    expect(view?.steps).toEqual(['text']);
    expect(view?.points).toBeNull();
    expect(view?.testId).toBe('test-t');
    expect(view?.topicTitle).toBe('Cəmin və fərqin kubu');
  });

  it('is null with neither', () => {
    expect(lessonView({ demo: null, book: null, answers, topic, testId: 'x' })).toBeNull();
  });
});
