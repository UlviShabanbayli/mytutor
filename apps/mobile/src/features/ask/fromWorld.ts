import type { TFunction } from 'i18next';
import type { AskQuestion as WorldQuestion, AskQuestionView } from '@mytutor/types';
import { askSubjectOf } from './subjects';
import type { AskQuestion } from './types';

/** The world's photo questions as the ask screens show them. */

const at = (
  q: Pick<WorldQuestion, 'timeline'>,
  event: WorldQuestion['timeline'][number]['event'],
) => q.timeline.find((e) => e.event === event)?.at ?? null;

/** "Riyaziyyat 7": the world's label, or the subject's name for one outside the curriculum. */
function subjectLabel(t: TFunction, q: AskQuestionView): string {
  if (q.subjectLabel !== q.subjectId) return q.subjectLabel;
  const known = askSubjectOf(q.subjectId);
  return known
    ? t('ask.demo.subjectLabel', {
        subject: t(`ask.demo.subjects.${known.subject}`),
        grade: known.grade,
      })
    : q.subjectId;
}

/** A question still on the device, before the world (and its labels) has it. */
export const queuedView = (q: WorldQuestion): AskQuestionView => ({
  ...q,
  studentName: q.studentId,
  teacherName: null,
  subjectLabel: q.subjectId,
  topic: null,
});

export function toAskQuestion(t: TFunction, q: AskQuestionView): AskQuestion {
  return {
    id: q.id,
    title: q.title,
    mark: q.mark,
    photoUri: q.photoUri,
    subjectLabel: subjectLabel(t, q),
    queue: q.queue,
    teacherName: q.teacherName,
    note: q.note,
    sentAt: at(q, 'sent') ?? q.timeline[0]?.at ?? '',
    aiSolvedAt: at(q, 'ai_solved'),
    answeredAt: at(q, 'answered'),
    status: q.status,
    // A draft still being solved is not shown yet.
    aiDraft:
      q.aiDraft?.status === 'ready' && q.aiDraft.answer !== null
        ? { answer: q.aiDraft.answer, steps: q.aiDraft.steps }
        : null,
    answer: q.answer
      ? {
          steps: q.answer.steps,
          teacherName: q.teacherName ?? '',
          teacherNote: q.answer.teacherNote,
          correctedAi: q.answer.correctedAi,
        }
      : null,
    source: q.source,
    topic: q.topic,
    similar: q.similar,
  };
}
