import type { AskQuestion, DemoEvent, DemoWorld, SolutionStep } from '@mytutor/types';
import { demoSource, readyTopic } from '../curriculum';

/**
 * Event handlers for photo questions: sent, answered (approved or edited by the teacher) and
 * taken back by the student before anyone answered.
 */

type Of<T extends DemoEvent['type']> = Extract<DemoEvent, { type: T }>;

export function askSent(w: DemoWorld, e: Of<'ask.sent'>) {
  if (w.askQuestions.some((q) => q.id === e.question.id)) return;
  w.askQuestions.push(e.question);
  if (e.question.teacherId)
    w.notifications.push({
      id: `n-${e.id}`,
      kind: 'question',
      recipientId: e.question.teacherId,
      role: 'teacher',
      at: e.at,
      read: false,
      questionId: e.question.id,
      studentId: e.question.studentId,
    });
}

/** The approved steps: the AI's, or one step with its answer when it had none. */
function approvedSteps(q: AskQuestion, note: string | undefined): SolutionStep[] {
  const steps = q.answer?.steps ?? q.aiDraft?.steps ?? [];
  if (steps.length > 0) return steps;
  return [
    {
      id: 's1',
      text: note?.trim() || 'Müəllimin cavabı',
      formula: q.aiDraft?.answer ?? q.mark,
      edited: true,
    },
  ];
}

/** A topic of the ready textbook, or null for an id the demo does not have. */
function safeTopic(topicId: string) {
  try {
    return readyTopic(topicId);
  } catch {
    return null;
  }
}

export function askAnswered(w: DemoWorld, e: Of<'ask.answered'>) {
  const q = w.askQuestions.find((x) => x.id === e.questionId);
  if (!q || q.status === 'answered') return;
  const note = e.note?.trim() ? e.note.trim() : null;
  q.status = 'answered';
  q.teacherId = e.teacherId;
  q.timeline.push({ event: 'answered', at: e.at });
  const topic = e.topicId ? safeTopic(e.topicId) : null;
  if (topic) {
    q.topicId = topic.id;
    q.source = demoSource(topic.id, 'demo');
  }
  q.answer = {
    teacherId: e.teacherId,
    steps: e.steps ?? approvedSteps(q, e.note),
    teacherNote: note,
    correctedAi: note !== null || e.steps !== undefined,
  };
  w.notifications.push({
    id: `n-${e.id}`,
    kind: 'answerReady',
    recipientId: q.studentId,
    role: 'student',
    at: e.at,
    read: false,
    questionId: q.id,
    teacherId: e.teacherId,
  });
}

/** The student takes back a question no one answered yet; its notices go with it. */
export function askCancelled(w: DemoWorld, e: Of<'ask.cancelled'>) {
  const q = w.askQuestions.find((x) => x.id === e.questionId && x.studentId === e.studentId);
  if (!q || q.status === 'answered') return;
  w.askQuestions = w.askQuestions.filter((x) => x !== q);
  w.notifications = w.notifications.filter(
    (n) => !((n.kind === 'question' || n.kind === 'answerReady') && n.questionId === q.id),
  );
}
