import { useQuery } from '@tanstack/react-query';
import { fetchComeback, fetchInbox, fetchMotivation, fetchToday } from './demo';

export const todayKeys = {
  today: ['today'] as const,
  motivation: ['today', 'motivation'] as const,
  comeback: ['today', 'comeback'] as const,
  inbox: ['today', 'inbox'] as const,
};

export function useToday() {
  return useQuery({ queryKey: todayKeys.today, queryFn: fetchToday });
}

export function useMotivationData() {
  return useQuery({ queryKey: todayKeys.motivation, queryFn: fetchMotivation });
}

export function useComeback() {
  return useQuery({ queryKey: todayKeys.comeback, queryFn: fetchComeback });
}

export function useInbox() {
  return useQuery({ queryKey: todayKeys.inbox, queryFn: fetchInbox });
}
