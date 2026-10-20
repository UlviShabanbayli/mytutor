import type { DemoEvent, DemoWorld, Submission } from '@mytutor/types';

/**
 * Event handlers for class work: assignments, submissions and grades.
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
