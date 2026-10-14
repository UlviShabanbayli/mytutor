import { useQuery } from '@tanstack/react-query';
import { testQuestionsDocumentSchema, topicCatalogueSchema } from '@mytutor/schemas';
import { getJson } from '@/features/content/api';

/** The questions split from a test book, once there are any. */
export function useTestQuestions(path: string | null) {
  return useQuery({
    queryKey: ['content', 'test-questions', path],
    queryFn: () => getJson(path ?? '', testQuestionsDocumentSchema),
    enabled: path !== null,
  });
}

/** The textbook topics a test book's questions may be keyed to. */
export function useTopicCatalogue(path: string | null) {
  return useQuery({
    queryKey: ['content', 'topic-catalogue', path],
    queryFn: () => getJson(path ?? '', topicCatalogueSchema),
    enabled: path !== null,
  });
}
