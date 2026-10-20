import type { AskQuestion, AskQuestionView, AskUsage, DemoWorld } from '@mytutor/types';
import { topicById } from '../curriculum';
import { teacherTitle } from '../people';
import { personOf } from './common';

/** GET /v1/ask/questions[/:id], /v1/ask/usage; the teacher's inbox uses the same view. */

/** Reading time of a topic's lesson: its video plus the examples. */
const lessonMinutes = (world: DemoWorld, topicId: string) =>
  (world.lessons.find((l) => l.id === topicId)?.video.minutes ?? 2) + 4;

export function askView(world: DemoWorld, q: AskQuestion): AskQuestionView {
  const topic = q.topicId ? topicById(q.topicId) : null;
  const subject = world.curriculum.subjects.find((s) => s.id === q.subjectId);
  return {
    ...q,
    studentName: personOf(world, q.studentId)?.fullName ?? q.studentId,
    teacherName: q.teacherId ? teacherTitle(q.teacherId) : null,
    subjectLabel: subject ? `${subject.name} ${subject.grade}` : q.subjectId,
    topic: topic
      ? {
          id: topic.id,
          number: topic.number,
          title: topic.shortTitle,
          lessonId: topic.id,
          lessonMinutes: lessonMinutes(world, topic.id),
        }
      : null,
  };
}

const sentAt = (q: AskQuestion) => q.timeline[0]?.at ?? '';

/** The persona student's questions, newest first. */
export const selectAskQuestions = (world: DemoWorld): AskQuestionView[] =>
  world.askQuestions
    .filter((q) => q.studentId === world.student.personId)
    .sort((a, b) => sentAt(b).localeCompare(sentAt(a)))
    .map((q) => askView(world, q));

export const selectAskQuestion = (world: DemoWorld, id: string): AskQuestionView | null =>
  selectAskQuestions(world).find((q) => q.id === id) ?? null;

export const selectAskUsage = (world: DemoWorld): AskUsage => world.askUsage;
