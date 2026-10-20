import { useRef, useState } from 'react';
import { View } from 'react-native';
import { useHandoffStore } from '@/features/transitions/handoffStore';
import type { CellState } from '@/components/ui';
import { useReducedMotionPref } from '@/motion';
import { FlyingCell } from './FlyingCell';

type HandoffOverlayProps = {
  /** The topic number of the finished test. */
  code: string;
  /** The level the cell reaches with this result. */
  to: CellState;
};

/**
 * Over the result screen: flies the topic cell from the test header to the result card
 * (transitions.handoff B). Nothing shows with less motion; the screens just cross-fade.
 */
export function HandoffOverlay({ code, to }: HandoffOverlayProps) {
  const ref = useRef<View>(null);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const reduced = useReducedMotionPref();
  const flight = useHandoffStore((s) => (s.flight?.code === code ? s.flight : null));
  const target = useHandoffStore((s) => s.target);
  const land = useHandoffStore((s) => s.land);
  const ready = !reduced && flight && target && origin;

  return (
    <View
      ref={ref}
      pointerEvents="none"
      onLayout={() => ref.current?.measureInWindow((x, y) => setOrigin({ x, y }))}
      className="absolute inset-0"
    >
      {ready ? (
        <FlyingCell
          code={code}
          to={to}
          from={flight.from}
          target={target}
          origin={origin}
          onLanded={land}
        />
      ) : null}
    </View>
  );
}
