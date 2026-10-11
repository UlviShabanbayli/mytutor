import type { Tone } from '@/components/ui';
import type { BlockCategory } from '@/features/source/blocks';

export const categoryTone: Record<BlockCategory, Tone> = {
  explanation: 'primary',
  example: 'accent',
  box: 'success',
  task: 'neutral',
  review: 'destructive',
};

export const CATEGORIES: BlockCategory[] = ['explanation', 'example', 'box', 'task', 'review'];
