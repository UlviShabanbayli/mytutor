import { useQuery } from '@tanstack/react-query';
import { answersDocumentSchema } from '@mytutor/schemas';
import { contentUrl } from '@/features/content/api';

/** A book's answer key (`answers/answers.json`), when it has been read; null otherwise. */
export function useAnswerKey(path: string | null) {
  return useQuery({
    queryKey: ['content', 'answers', path],
    queryFn: async () => {
      if (!path) return null;
      const res = await fetch(contentUrl(path));
      if (!res.ok) throw new Error(`${res.status} ${path}`);
      return answersDocumentSchema.parse(await res.json());
    },
  });
}
