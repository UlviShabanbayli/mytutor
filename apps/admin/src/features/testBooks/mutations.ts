import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SubjectId } from '@mytutor/types';
import { addTestBook, deleteTestBook } from './api';

/** Everything under ['content'] is derived from files the actions write. */
const contentKey = ['content'] as const;

type NewTestBook = { file: File; title: string; subject: SubjectId };

export function useAddTestBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, title, subject }: NewTestBook) => addTestBook(file, title, subject),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: contentKey }),
  });
}

export function useDeleteTestBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (testBookId: string) => deleteTestBook(testBookId),
    // Not awaited, so the deleted book's page leaves before the index drops it; also on
    // error, since "no such test book" means the list is stale.
    onSettled: () => void queryClient.invalidateQueries({ queryKey: contentKey }),
  });
}
