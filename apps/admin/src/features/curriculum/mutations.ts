import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CurriculumInput, CurriculumLinksInput } from '@mytutor/types';
import { createCurriculum, deleteCurriculum, saveCurriculum, saveCurriculumLinks } from './api';

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

export function useSaveCurriculumLinks(bookId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (links: CurriculumLinksInput) => saveCurriculumLinks(bookId, links),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: contentKey }),
  });
}
