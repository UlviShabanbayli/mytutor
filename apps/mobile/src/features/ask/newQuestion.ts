import type { AskQuestion as WorldQuestion } from '@mytutor/types';
import { worldSubjectId, type AskSubjectId } from './subjects';
import type { AskQueue } from './types';

/** A photo the demo event can carry: a short device path, never an inline (data:) image. */
export function shareablePhoto(uri: string): string | null {
  return uri.startsWith('data:') || uri.length > 1024 ? null : uri;
}

type NewQuestion = {
  studentId: string;
  subjectId: AskSubjectId;
  grade: number;
  note: string;
  /** The class teacher who answers; null sends the question to the general queue. */
  teacher: { classId: string; teacherId: string } | null;
  photoUri: string;
  /** "Riyaziyyat": the subject's name, for the title and the paper thumbnail. */
  subjectName: string;
  title: string;
  now: Date;
};

/**
 * A just-sent photo question in the world's shape (`ask.sent`): the AI starts on it and the
 * teacher's inbox shows it. An inline photo stays on the device (see `shareablePhoto`).
 */
export function newQuestion(q: NewQuestion): WorldQuestion {
  return {
    id: `q-${q.studentId}-${q.now.getTime().toString(36)}`,
    studentId: q.studentId,
    classId: q.teacher?.classId ?? null,
    queue: (q.teacher ? 'teacher' : 'general') satisfies AskQueue,
    teacherId: q.teacher?.teacherId ?? null,
    subjectId: worldSubjectId(q.subjectId, q.grade),
    topicId: null,
    title: q.title,
    mark: q.subjectName,
    photoUri: shareablePhoto(q.photoUri),
    note: q.note.trim(),
    status: 'sent',
    timeline: [{ event: 'sent', at: q.now.toISOString() }],
    aiDraft: { status: 'solving', answer: null, steps: [] },
    answer: null,
    source: null,
    similar: [],
  };
}
