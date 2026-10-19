import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ContentIndex, StandardSetInput, StandardLinksInput } from '@mytutor/types';
import { createStandardSet, deleteStandardSet, saveStandardSet, saveStandardLinks } from './api';

const contentKey = ['content'] as const;
const indexKey = ['content', 'index'] as const;

export function useCreateStandardSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StandardSetInput) => createStandardSet(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: contentKey }),
  });
}

export function useSaveStandardSet(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StandardSetInput) => saveStandardSet(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: contentKey }),
  });
}

export function useDeleteStandardSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStandardSet(id),
    onSettled: () => void queryClient.invalidateQueries({ queryKey: contentKey }),
  });
}

export function useSaveStandardLinks(bookId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (links: StandardLinksInput) => saveStandardLinks(bookId, links),
    onSuccess: ({ updatedAt }, links) => {
      // The saved links count at once: an edit made before the index reloads starts from them,
      // so it never brings back what the previous save changed.
      queryClient.setQueryData<ContentIndex>(indexKey, (index) =>
        index
          ? {
              ...index,
              books: index.books.map((book) =>
                book.id === bookId ? { ...book, standardLinks: { ...links, updatedAt } } : book,
              ),
            }
          : index,
      );
      return queryClient.invalidateQueries({ queryKey: contentKey });
    },
  });
}
