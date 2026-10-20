import { useState } from 'react';
import { useReducedMotionPref } from '@/motion';
import { useHandoffStore } from './handoffStore';

/**
 * transitions.handoff B, seen from the result card: whether the test's topic cell `code` is
 * flying in (taken once, when the result opens) and whether it has landed. A flown cell has
 * already changed level on its way, so the card shows the new level without playing it again.
 */
export function useHandoffArrival(code: string): { flown: boolean; landed: boolean } {
  const reduced = useReducedMotionPref();
  const [flown] = useState(() => {
    const s = useHandoffStore.getState();
    return !reduced && !s.landed && s.flight?.code === code;
  });
  const landed = useHandoffStore((s) => s.landed || s.flight?.code !== code);
  return { flown, landed: !flown || landed };
}
