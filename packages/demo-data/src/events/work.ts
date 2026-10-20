import type { AskQuestion, DemoEvent, DemoWorld, SolutionStep, Submission } from '@mytutor/types';

/**
 * Event handlers for work and talk: assignments, submissions, grades, messages and questions.
 * Each one changes the draft world it is given (a private copy made by `applyDemoEvents`) and
 * ignores events that point at nothing.
 */

type Of<T extends DemoEvent['type']> = Extract<DemoEvent, { type: T }>;

function submissionFor(w: DemoWorld, assignmentId: string, studentId: string): Submission | null {
  const assignment = w.assignments.find((a) => a.id === assignmentId);
  if (!assignment) return null;
  const found = w.submissions.find(
    (s) => s.assignmentId === assignmentId && s.studentId === studentId,
  );
  if (found) return found;
  const created: Submission = {
    id: `sub-${assignmentId}-${studentId}`,
    assignmentId,
    studentId,
    state: 'not_started',
    progress: null,
    submittedAt: null,
    photos: 0,
    pages: [],
    ai: null,
    grade: null,
    comment: '',
    gradedAt: null,
  };
  w.submissions.push(created);
  return created;
}

export function assignmentCreated(w: DemoWorld, e: Of<'assignment.created'>) {
  if (w.assignments.some((a) => a.id === e.assignment.id)) return;
  w.assignments.push(e.assignment);
  const me = w.student.personId;
  if (w.members.some((m) => m.classId === e.assignment.classId && m.personId === me))
    w.notifications.push({
      id: `n-${e.id}`,
      kind: 'newAssignment',
      recipientId: me,
      role: 'student',
      at: e.at,
      read: false,
      assignmentId: e.assignment.id,
    });
}

export function assignmentSubmitted(w: DemoWorld, e: Of<'assignment.submitted'>) {
  const s = submissionFor(w, e.assignmentId, e.studentId);
  if (!s || s.state === 'checked') return;
  const kind = w.assignments.find((a) => a.id === e.assignmentId)?.kind;
  s.state = 'submitted';
  s.submittedAt = e.at;
  if (kind === 'homework') s.photos = Math.max(1, s.photos);
}

export function assignmentGraded(w: DemoWorld, e: Of<'assignment.graded'>) {
  const s = submissionFor(w, e.assignmentId, e.studentId);
  if (!s) return;
  s.state = 'checked';
  s.submittedAt ??= e.at;
  s.grade = { score: e.score, max: e.outOf };
  if (e.comment !== undefined) s.comment = e.comment;
  s.gradedAt = e.at;
  const cls = w.classes.find(
    (c) => c.id === w.assignments.find((a) => a.id === e.assignmentId)?.classId,
  );
  w.notifications.push({
    id: `n-${e.id}`,
    kind: 'assignmentGraded',
    recipientId: e.studentId,
    role: 'student',
    at: e.at,
    read: false,
    assignmentId: e.assignmentId,
    teacherId: cls?.teacherId ?? w.teacher.personId,
    score: e.score,
    outOf: e.outOf,
  });
}

export function messageSent(w: DemoWorld, e: Of<'message.sent'>) {
  const thread = w.threads.find((t) => t.id === e.threadId);
  if (!thread || !thread.memberIds.includes(e.fromPersonId)) return;
  w.messages.push({
    id: e.id,
    threadId: thread.id,
    authorId: e.fromPersonId,
    text: e.text,
    at: e.at,
    replyToId: null,
    reported: false,
  });
  // The sender has read everything up to their own message.
  thread.readAt[e.fromPersonId] = e.at;
  const parent = thread.memberIds.find((id) => id === w.parent.personId);
  if (thread.kind === 'parent' && parent && e.fromPersonId !== parent)
    w.notifications.push({
      id: `n-${e.id}`,
      kind: 'teacherMessage',
      recipientId: parent,
      role: 'parent',
      at: e.at,
      read: false,
      teacherId: e.fromPersonId,
      threadId: thread.id,
    });
}

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

export function askAnswered(w: DemoWorld, e: Of<'ask.answered'>) {
  const q = w.askQuestions.find((x) => x.id === e.questionId);
  if (!q || q.status === 'answered') return;
  const note = e.note?.trim() ? e.note.trim() : null;
  q.status = 'answered';
  q.teacherId = e.teacherId;
  q.timeline.push({ event: 'answered', at: e.at });
  q.answer = {
    teacherId: e.teacherId,
    steps: approvedSteps(q, e.note),
    teacherNote: note,
    correctedAi: note !== null,
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
