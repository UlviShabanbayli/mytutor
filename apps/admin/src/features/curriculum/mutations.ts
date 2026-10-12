import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ContentIndex, CurriculumInput, CurriculumLinksInput } from '@mytutor/types';
import { createCurriculum, deleteCurriculum, saveCurriculum, saveCurriculumLinks } from './api';

const contentKey = ['content'] as const;
const indexKey = ['content', 'index'] as const;

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
    onSuccess: ({ updatedAt }, links) => {
      // The saved links count at once: an edit made before the index reloads starts from them,
      // so it never brings back what the previous save changed.
      queryClient.setQueryData<ContentIndex>(indexKey, (index) =>
        index
          ? {
              ...index,
              books: index.books.map((book) =>
                book.id === bookId ? { ...book, curriculumLinks: { ...links, updatedAt } } : book,
              ),
            }
          : index,
      );
      return queryClient.invalidateQueries({ queryKey: contentKey });
    },
  });
}
