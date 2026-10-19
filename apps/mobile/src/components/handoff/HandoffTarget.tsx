import { type ReactNode, useRef } from 'react';
import { View } from 'react-native';
import { useHandoffStore } from '@/features/transitions/handoffStore';
import { cn } from '@/lib/cn';
import { useReducedMotionPref } from '@/motion';

type HandoffTargetProps = {
  /** The topic number the flying cell must carry to land here. */
  code: string;
  children: ReactNode;
};

/**
 * Where the test's topic cell lands on the result card (transitions.handoff B). While the cell
 * is on its way, the card's own cell waits unseen in its place.
 */
export function HandoffTarget({ code, children }: HandoffTargetProps) {
  const ref = useRef<View>(null);
  const reduced = useReducedMotionPref();
  const waiting = useHandoffStore((s) => !reduced && !s.landed && s.flight?.code === code);
  const setTarget = useHandoffStore((s) => s.setTarget);

  return (
    <View
      ref={ref}
      onLayout={() => {
        if (!waiting) return;
        ref.current?.measureInWindow((x, y, width, height) => setTarget({ x, y, width, height }));
      }}
      className={cn(waiting && 'opacity-0')}
    >
      {children}
    </View>
  );
}
