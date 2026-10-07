import { useQuery } from '@tanstack/react-query';
import { fetchRecommendedTopic, fetchSubject, fetchSubjects, fetchTest } from './api';

export const testKeys = {
  subjects: ['subjects'] as const,
  subject: (id: string) => ['subjects', id] as const,
  test: (id: string) => ['tests', id] as const,
  recommended: ['tests', 'recommended'] as const,
};

export function useSubjects() {
  return useQuery({ queryKey: testKeys.subjects, queryFn: fetchSubjects });
}

export function useSubject(subjectId: string) {
  return useQuery({
    queryKey: testKeys.subject(subjectId),
    queryFn: () => fetchSubject(subjectId),
  });
}

export function useTest(testId: string) {
  return useQuery({ queryKey: testKeys.test(testId), queryFn: () => fetchTest(testId) });
}

export function useRecommendedTopic() {
  return useQuery({ queryKey: testKeys.recommended, queryFn: fetchRecommendedTopic });
}
