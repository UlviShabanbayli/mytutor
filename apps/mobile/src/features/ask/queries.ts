import { useEffect, useMemo } from 'react';
import { onlineManager, useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { askQuestionViewSchema, askUsageSchema, notificationSchema } from '@mytutor/schemas';
import type { DemoPersona } from '@mytutor/types';
import { useClasses, useMe } from '@/features/me/queries';
import { apiGet } from '@/lib/api';
import { useDemoWrite } from '@/lib/demoEvents';
import { useDemoPersona } from '@/lib/demoPersona';
import { useChatStore } from './chatStore';
import { daysAgo } from './dates';
import { queuedView, toAskQuestion } from './fromWorld';
import { sortNewest } from './questions';
import { useAskStore } from './store';
import { newQuestion } from './newQuestion';
import { CLASS_SUBJECT_ID, type AskSubjectId } from './subjects';
import type { AskQueue, AskUsage } from './types';
import { useOnline } from './useOnline';

// The ask area's server state: the student's photo questions in the demo world
// (/v1/ask/questions through `apiGet`), plus those taken offline and still on the device. A
// sent question is the demo event `ask.sent`, so the teacher's inbox has it too.

export const askKeys = {
  questions: (persona: DemoPersona) => ['ask', persona, 'questions'] as const,
  usage: (persona: DemoPersona) => ['ask', persona, 'usage'] as const,
  notifications: (persona: DemoPersona) => ['ask', persona, 'notifications'] as const,
};

/** The student's grade: the one chosen for this question, else the world's. */
export function useStudentGrade(): number | undefined {
  const own = useMe().data?.profile.grade;
  const chosen = useAskStore((s) => s.grade);
  return chosen ?? own;
}

/** The student's photo questions, newest first (the world's plus those waiting offline). */
export function useAskQuestions() {
  const { t } = useTranslation();
  const persona = useDemoPersona();
  const query = useQuery({
    queryKey: askKeys.questions(persona),
    queryFn: () =>
      apiGet('/v1/ask/questions', { persona, parse: askQuestionViewSchema.array().parse }),
  });
  const queued = useAskStore((s) => s.queued);
  const photos = useAskStore((s) => s.photos);

  const data = useMemo(() => {
    if (!query.data) return undefined;
    const all = [...queued.map(queuedView), ...query.data].map((q) => ({
      ...toAskQuestion(t, q),
      // A photo kept on this device when the event could not carry it.
      photoUri: q.photoUri ?? photos[q.id] ?? null,
    }));
    return sortNewest(all);
  }, [query.data, queued, photos, t]);

  return { ...query, data };
}

export function useAskQuestion(id: string) {
  const query = useAskQuestions();
  return { ...query, question: query.data?.find((q) => q.id === id) ?? null };
}

/**
 * Today's free-plan usage: the world's limits, the photo questions sent today (counted from
 * the questions themselves) and this device's Vızı messages.
 */
export function useAskUsage(): { usage: AskUsage | undefined; isPending: boolean } {
  const persona = useDemoPersona();
  const query = useQuery({
    queryKey: askKeys.usage(persona),
    queryFn: () => apiGet('/v1/ask/usage', { persona, parse: askUsageSchema.parse }),
  });
  const questions = useAskQuestions().data;
  const chatUsed = useChatStore((s) => s.used);
  const now = new Date();
  const sentToday = questions?.filter((q) => daysAgo(new Date(q.sentAt), now) === 0).length;

  const usage =
    query.data && sentToday !== undefined
      ? {
          ...query.data,
          photoUsed: Math.max(query.data.photoUsed, sentToday),
          chatUsed: query.data.chatUsed + chatUsed,
        }
      : undefined;
  return { usage, isPending: query.isPending };
}

export type ClassTeacher = {
  classId: string;
  /** "7B". */
  className: string;
  teacherId: string;
  /** "Lalə Həsənova". */
  teacherName: string;
};

/** Who answers a class question: the teacher of the student's (maths) class; null without one. */
export function useClassTeacher(): ClassTeacher | null {
  const first = useClasses().data?.[0];
  return first
    ? {
        classId: first.id,
        className: first.short,
        teacherId: first.teacherId,
        teacherName: first.teacher,
      }
    : null;
}

type SendInput = {
  subjectId: AskSubjectId;
  grade: number;
  note: string;
  queue: AskQueue;
};

/**
 * Files the draft photo as a question. Online it is the demo event `ask.sent` (the AI starts
 * on it, the teacher's inbox shows it); offline it waits on the device ("queued") and goes out
 * when the connection returns (`useSendQueuedQuestions`).
 */
export function useSendQuestion() {
  const write = useDemoWrite();
  const studentId = useMe().data?.person.id;
  const teacher = useClassTeacher();
  const { t } = useTranslation();

  return useMutation({
    networkMode: 'always',
    mutationFn: async ({ subjectId, grade, note, queue }: SendInput): Promise<{ id: string }> => {
      const { draft, enqueue, clearDraft, keepPhoto } = useAskStore.getState();
      if (!draft) throw new Error('No photo to send');
      if (!studentId) throw new Error('The student is not loaded yet');
      const subjectName = t(`ask.demo.subjects.${subjectId}`);
      const question = newQuestion({
        studentId,
        subjectId,
        grade,
        note,
        teacher: queue === 'teacher' && subjectId === CLASS_SUBJECT_ID ? teacher : null,
        photoUri: draft.uri,
        subjectName,
        title: t('ask.demo.newQuestionTitle', { subject: subjectName }),
        now: new Date(),
      });
      keepPhoto(question.id, draft.uri);
      if (onlineManager.isOnline()) write({ type: 'ask.sent', question });
      else enqueue({ ...question, status: 'queued' });
      clearDraft();
      return { id: question.id };
    },
  });
}

/** Sends the questions taken offline as soon as the device is online (on the Ask tab). */
export function useSendQueuedQuestions(): void {
  const online = useOnline();
  const queued = useAskStore((s) => s.queued);
  const dequeue = useAskStore((s) => s.dequeue);
  const write = useDemoWrite();

  useEffect(() => {
    if (!online || queued.length === 0) return;
    const at = new Date().toISOString();
    for (const q of [...queued].reverse()) {
      const question = {
        ...q,
        status: 'sent' as const,
        timeline: [{ event: 'sent' as const, at }],
      };
      write({ type: 'ask.sent', question });
      dequeue(q.id);
    }
  }, [online, queued, dequeue, write]);
}

/** Opening an answered question reads its "answer ready" notification (`notification.read`). */
export function useReadAnswerNotification(questionId: string, answered: boolean): void {
  const persona = useDemoPersona();
  const write = useDemoWrite();
  const notifications = useQuery({
    queryKey: askKeys.notifications(persona),
    enabled: answered,
    queryFn: () =>
      apiGet('/v1/notifications', { persona, parse: notificationSchema.array().parse }),
  });
  const unread = notifications.data?.find(
    (n) => n.kind === 'answerReady' && n.questionId === questionId && !n.read,
  );

  useEffect(() => {
    if (unread) write({ type: 'notification.read', notificationId: unread.id });
  }, [unread, write]);
}

/**
 * "Sualı ləğv et": a question still waiting on the device is dropped there; a sent one is taken
 * back with the demo event `ask.cancelled`, so it leaves the teacher's inbox too.
 */
export function useCancelQuestion(): (questionId: string) => void {
  const write = useDemoWrite();
  const studentId = useMe().data?.person.id;
  return (questionId) => {
    const { queued, cancel } = useAskStore.getState();
    if (queued.some((q) => q.id === questionId)) {
      cancel(questionId);
      return;
    }
    if (studentId) write({ type: 'ask.cancelled', questionId, studentId });
  };
}
