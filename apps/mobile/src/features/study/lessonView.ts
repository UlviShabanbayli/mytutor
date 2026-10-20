import type { BookAnswers, BookLesson, CourseTopic, StudyLesson } from '@mytutor/types';
import { plainMath } from './plainMath';
import type { BookAnswerRow, LessonStepName, LessonView } from './types';

/** What a lesson is made of: the demo lesson, the book's text and answers, the topic. */
export type LessonParts = {
  demo: StudyLesson | null;
  book: BookLesson | null;
  answers: BookAnswers | null;
  /** The topic in the curriculum (its title and pages), for a lesson without a demo lesson. */
  topic: Pick<CourseTopic, 'id' | 'number' | 'shortTitle' | 'pages'> | null;
  testId: string;
};

const pagesOf = (pages: { start: number; end: number }) =>
  pages.start === pages.end ? `s. ${pages.start}` : `s. ${pages.start}–${pages.end}`;

function answerRows(answers: BookAnswers): BookAnswerRow[] {
  return answers.answers
    .filter((a) => a.status !== 'mismatch')
    .map((a) => ({
      id: a.id,
      exercise: a.exercise,
      page: a.page,
      text: a.parts.map((p) => (p.label ? `${p.label}) ${p.text}` : p.text)).join('; '),
    }));
}

/**
 * The lesson the screens show: the book's approved text first (from the local content folder),
 * the demo lesson's text otherwise; the video, example and exercise of the demo lesson. Null when
 * there is neither a demo lesson nor a book text.
 */
export function lessonView({ demo, book, answers, topic, testId }: LessonParts): LessonView | null {
  if (!demo && !book) return null;
  const number = demo?.topicCode ?? book?.number ?? topic?.number ?? '';
  const title = demo?.topicTitle ?? topic?.shortTitle ?? number;
  const bookLine = book
    ? topic
      ? `${book.book} · ${number} (${pagesOf(topic.pages)})`
      : `${book.book} · ${number}`
    : null;
  const pages = book
    ? book.sections.map((section) => ({
        heading: section.heading ?? title,
        paragraphs: section.paragraphs.map(plainMath),
        rule: null,
        after: null,
        note: null,
        askVizi: null,
      }))
    : (demo?.pages ?? []);
  const rows = answers ? answerRows(answers) : [];
  const steps: LessonStepName[] = [
    ...(demo ? (['video'] as const) : []),
    'text',
    ...(demo ? (['example', 'exercise'] as const) : []),
  ];
  return {
    id: demo?.id ?? book?.topicId ?? '',
    topicCode: number,
    topicTitle: title,
    steps,
    video: demo?.video ?? null,
    pages,
    textSource: bookLine ?? demo?.source ?? '',
    fromBook: book !== null,
    example: demo?.example ?? null,
    exercise: demo?.exercise ?? null,
    source: demo?.source ?? bookLine ?? '',
    bookAnswers:
      answers && rows.length > 0
        ? { source: `${answers.book} · ${number} (${pagesOf(answers.pages)})`, items: rows }
        : null,
    points: demo?.points ?? null,
    testId: demo?.testId ?? testId,
  };
}
