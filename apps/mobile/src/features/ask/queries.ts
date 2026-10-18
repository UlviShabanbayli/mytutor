import { useMemo } from 'react';
import { onlineManager, useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { useAppStore } from '@/features/app/appStore';
import { useChatStore } from './chatStore';
import { daysAgo } from './dates';
import { demoQuestions, demoUsage, type DemoSubjectId } from './demo';
import { sortNewest } from './questions';
import { useAskStore } from './store';
import type { AskQuestion, AskQueue, AskUsage } from './types';

// Demo data until the ask and AI APIs exist (architecture Ş8, Ş9): the hooks serve local data,
// so they run offline too (`networkMode: 'always'`). The API will replace the query functions.

export const askKeys = {
  questions: (locale: string) => ['ask', 'questions', locale] as const,
  usage: ['ask', 'usage'] as const,
};

/** The demo grade when the profile has none: the design's student is in the 7th grade. */
export const DEFAULT_GRADE = 7;

export function useStudentGrade(): number {
  const profileGrade = useAppStore((s) => s.profile.grade);
  const chosen = useAskStore((s) => s.grade);
  return chosen ?? profileGrade ?? DEFAULT_GRADE;
}

/** The student's photo questions, newest first (demo history plus those sent from here). */
export function useAskQuestions() {
  const { i18n: instance } = useTranslation();
  const locale = instance.language;
  const query = useQuery({
    queryKey: askKeys.questions(locale),
    queryFn: async () => demoQuestions(i18n.t),
    networkMode: 'always',
  });
  const sent = useAskStore((s) => s.sent);
  const cancelled = useAskStore((s) => s.cancelledIds);

  const data = useMemo(
    () =>
      query.data
        ? sortNewest([...sent, ...query.data].filter((q) => !cancelled.includes(q.id)))
        : undefined,
    [query.data, sent, cancelled],
  );

  return { ...query, data };
}

export function useAskQuestion(id: string) {
  const query = useAskQuestions();
  return { ...query, question: query.data?.find((q) => q.id === id) ?? null };
}

/** Today's free-plan usage: the demo's earlier use plus what this device sent today. */
export function useAskUsage(): { usage: AskUsage | undefined; isPending: boolean } {
  const query = useQuery({
    queryKey: askKeys.usage,
    queryFn: async () => demoUsage(),
    networkMode: 'always',
  });
  const sent = useAskStore((s) => s.sent);
  const chatUsed = useChatStore((s) => s.used);
  const now = new Date();
  const sentToday = sent.filter((q) => daysAgo(new Date(q.sentAt), now) === 0).length;

  const usage = query.data
    ? {
        ...query.data,
        photoUsed: query.data.photoUsed + sentToday,
        chatUsed: query.data.chatUsed + chatUsed,
      }
    : undefined;
  return { usage, isPending: query.isPending };
}

type SendInput = {
  subjectId: DemoSubjectId;
  grade: number;
  note: string;
  queue: AskQueue;
};

/**
 * Files the draft photo as a question. Offline it waits on the device ("queued") and goes out
 * when the connection returns; online the AI draft would start on the server.
 */
export function useSendQuestion() {
  const addSent = useAskStore((s) => s.addSent);

  return useMutation({
    networkMode: 'always',
    mutationFn: async ({ subjectId, grade, note, queue }: SendInput): Promise<AskQuestion> => {
      const draft = useAskStore.getState().draft;
      if (!draft) throw new Error('No photo to send');
      const t = i18n.t;
      const subject = t(`ask.demo.subjects.${subjectId}`);
      return {
        id: `q-${Date.now().toString(36)}`,
        title: t('ask.demo.newQuestionTitle', { subject }),
        mark: '',
        photoUri: draft.uri,
        subjectLabel: t('ask.demo.subjectLabel', { subject, grade }),
        queue,
        teacherName: queue === 'teacher' ? t('ask.demo.teacherShort') : null,
        note: note.trim(),
        sentAt: new Date().toISOString(),
        aiSolvedAt: null,
        answeredAt: null,
        status: onlineManager.isOnline() ? 'sent' : 'queued',
        aiDraft: null,
        answer: null,
        source: null,
        topic: null,
        similar: [],
      };
    },
    onSuccess: (question) => addSent(question),
  });
}
