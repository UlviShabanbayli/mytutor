import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addBook, extractTopicSource } from './api';

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
