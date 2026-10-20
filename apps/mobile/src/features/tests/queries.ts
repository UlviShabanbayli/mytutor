import { useQuery } from '@tanstack/react-query';
import { fetchRecommendedTopic, fetchSubjects } from './api';

/** The tests published from the team's test books (local API only; empty on the Worker). */
const testKeys = {
  subjects: ['tests', 'published', 'subjects'] as const,
  recommended: ['tests', 'published', 'recommended'] as const,
};

export function useSubjects() {
  return useQuery({ queryKey: testKeys.subjects, queryFn: fetchSubjects });
}

export function useRecommendedTopic() {
  return useQuery({ queryKey: testKeys.recommended, queryFn: fetchRecommendedTopic });
}
