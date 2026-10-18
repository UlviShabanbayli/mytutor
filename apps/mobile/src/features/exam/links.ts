import type { Href } from 'expo-router';
import type { StepTarget } from './types';

/** Where a plan step opens: the lesson, the test, the review queue or the topic. */
export function stepHref(target: StepTarget): Href {
  switch (target.kind) {
    case 'review':
      return '/review';
    case 'lesson':
      return { pathname: '/lesson/[id]', params: { id: target.id } };
    case 'test':
      return { pathname: '/test/[id]', params: { id: target.id } };
    case 'topic':
      return { pathname: '/topic/[id]', params: { id: target.id } };
  }
}

export const mockHref = (id: string): Href => ({ pathname: '/mock/[id]', params: { id } });
export const mockRunHref = (id: string): Href => ({ pathname: '/mock/[id]/run', params: { id } });
export const mockResultHref = (id: string): Href => ({
  pathname: '/mock/[id]/result',
  params: { id },
});
