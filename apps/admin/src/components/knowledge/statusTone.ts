import type { KnowledgeStatus } from '@mytutor/types';
import type { Tone } from '@/components/ui';

export const statusTone: Record<KnowledgeStatus, Tone> = {
  textbook: 'success',
  derived: 'accent',
  unverified: 'destructive',
};

export const STATUSES: KnowledgeStatus[] = ['textbook', 'derived', 'unverified'];
