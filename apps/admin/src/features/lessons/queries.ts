import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  decideLessonDraft,
  estimateLessonText,
  fetchLesson,
  writeLessonText,
  type LessonRef,
} from './api';

const lessonKey = (ref: LessonRef) =>
  ['content', 'lesson', ref.curriculumId, ref.bookId, ref.number] as const;

/** The lesson file, when the index lists one; null before anything is written. */
export function useLesson(ref: LessonRef, path: string | null) {
  return useQuery({
    queryKey: [...lessonKey(ref), path],
    queryFn: () => (path ? fetchLesson(path) : Promise.resolve(null)),
  });
}

export function useLessonTextEstimate(ref: LessonRef, enabled: boolean) {
  return useQuery({
    queryKey: [...lessonKey(ref), 'estimate'],
    queryFn: () => estimateLessonText(ref),
    enabled,
    staleTime: 60_000,
  });
}

/** Writing, approving and dropping drafts; each refreshes the index and the lesson. */
export function useLessonTextActions(ref: LessonRef) {
  const queryClient = useQueryClient();
  const refresh = () => void queryClient.invalidateQueries({ queryKey: ['content'] });
  return {
    write: useMutation({ mutationFn: () => writeLessonText(ref), onSettled: refresh }),
    decide: useMutation({
      mutationFn: (approve: boolean) => decideLessonDraft(ref, approve),
      onSettled: refresh,
    }),
  };
}
