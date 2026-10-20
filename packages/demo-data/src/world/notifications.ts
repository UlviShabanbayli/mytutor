import type { AppNotification, NotificationPrefs, ReviewPlan, WeekReport } from '@mytutor/types';
import type { Clock } from '../clock';
import { LALE, NERMIN, SEBINE } from '../ids';
import { THREAD_SEBINE } from './messages';

/** What the student's notices report, taken from the world so they always agree with it. */
export type NoticeFacts = { streak: number; review: ReviewPlan; week: WeekReport | undefined };

/** Each role's in-app notifications; the student's only in Nərmin's world. */
export function notifications(
  clock: Clock,
  studentId: string,
  { streak, review, week }: NoticeFacts,
): AppNotification[] {
  const accuracy = week
    ? Math.round((week.answers.correct / Math.max(1, week.answers.total)) * 100)
    : 0;
  const student: AppNotification[] =
    studentId === NERMIN && week && review.due.length > 0
      ? [
          {
            id: 'n-st-answer',
            kind: 'answerReady',
            recipientId: NERMIN,
            role: 'student',
            at: clock.ago(166),
            read: false,
            questionId: 'q-nermin-2',
            teacherId: LALE,
          },
          {
            id: 'n-st-assignment',
            kind: 'newAssignment',
            recipientId: NERMIN,
            role: 'student',
            at: clock.at(-1, 9, 0),
            read: false,
            assignmentId: 'quiz-4-2',
          },
          {
            id: 'n-st-review',
            kind: 'reviewDue',
            recipientId: NERMIN,
            role: 'student',
            at: clock.ago(330),
            read: true,
            cells: review.due.length,
            minutes: review.minutes,
          },
          {
            id: 'n-st-streak',
            kind: 'streak',
            recipientId: NERMIN,
            role: 'student',
            at: clock.at(-1, 20, 14),
            read: true,
            // Yesterday evening: the streak as it stands (today's goal is not met yet).
            days: streak,
          },
          {
            id: 'n-st-week',
            kind: 'weeklySummary',
            recipientId: NERMIN,
            role: 'student',
            at: clock.at(-1, 19, 0),
            read: true,
            topics: week.newTopics.length,
            accuracy,
          },
        ]
      : [];
  return [
    ...student,
    {
      id: 'n-te-question',
      kind: 'question',
      recipientId: LALE,
      role: 'teacher',
      at: clock.ago(14),
      read: false,
      questionId: 'q-nermin-1',
      studentId: NERMIN,
    },
    {
      id: 'n-te-homework',
      kind: 'homework',
      recipientId: LALE,
      role: 'teacher',
      at: clock.ago(60),
      read: false,
      assignmentId: 'hw-4-1',
      count: 6,
    },
    {
      id: 'n-te-verification',
      kind: 'verification',
      recipientId: LALE,
      role: 'teacher',
      at: clock.ago(24 * 60),
      read: true,
    },
    {
      id: 'n-pa-report',
      kind: 'weeklyReport',
      recipientId: SEBINE,
      role: 'parent',
      at: clock.at(-1, 19, 0),
      read: false,
      childId: NERMIN,
    },
    {
      id: 'n-pa-message',
      kind: 'teacherMessage',
      recipientId: SEBINE,
      role: 'parent',
      at: clock.ago(60),
      read: false,
      teacherId: LALE,
      threadId: THREAD_SEBINE,
    },
  ];
}

export const NOTIFICATION_PREFS: NotificationPrefs = {
  weeklyReport: true,
  assignmentLate: true,
  longBreak: false,
  teacherMessage: true,
};
