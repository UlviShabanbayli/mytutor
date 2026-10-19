import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CurriculumInput } from '@mytutor/types';
import {
  addCurriculumTextbook,
  createCurriculum,
  deleteCurriculum,
  removeCurriculumTextbook,
  saveCurriculum,
} from './api';

const contentKey = ['content'] as const;

export function useCreateCurriculum() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CurriculumInput) => createCurriculum(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: contentKey }),
  });
}

export function useSaveCurriculum(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CurriculumInput) => saveCurriculum(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: contentKey }),
  });
}

export function useDeleteCurriculum() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCurriculum(id),
    onSettled: () => void queryClient.invalidateQueries({ queryKey: contentKey }),
  });
}

/** Adds (`add: true`) or removes a textbook; one mutation so the list shows one pending state. */
export function useCurriculumTextbook(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookId, add }: { bookId: string; add: boolean }) =>
      add ? addCurriculumTextbook(id, bookId) : removeCurriculumTextbook(id, bookId),
    onSettled: () => queryClient.invalidateQueries({ queryKey: contentKey }),
  });
}
