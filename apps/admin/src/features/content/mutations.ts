import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addBook, deleteBook, extractTopicSource, restoreBook } from './api';

/** Everything under ['content'] is derived from files the actions write. */
const contentKey = ['content'] as const;

export function useAddBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, title }: { file: File; title: string }) => addBook(file, title),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: contentKey }),
  });
}

export function useExtractSource(bookId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (topic: string) => extractTopicSource(bookId, topic),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: contentKey }),
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookId: string) => deleteBook(bookId),
    // Not awaited: the deleted book's page leaves (onDeleted) before the new index drops the
    // book, so it never flashes "not found" or unmounts before the callbacks run. Also on
    // error: "no such book" means the shelf is stale, so it refreshes.
    onSettled: () => void queryClient.invalidateQueries({ queryKey: contentKey }),
  });
}

export function useRestoreBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (trashId: string) => restoreBook(trashId),
    // Also on error: "already restored" or "added again" means the shelf is stale.
    onSettled: () => queryClient.invalidateQueries({ queryKey: contentKey }),
  });
}
