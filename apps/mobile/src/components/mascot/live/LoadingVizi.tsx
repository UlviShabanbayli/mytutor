import { useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import {
  cancelAnimation,
  useAnimatedReaction,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { ease } from '../rig/ease';
import { setSpeed } from '../rig/moves/flap';
import { startLife } from '../rig/moves/life';
import { ViziRig } from '../rig/ViziRig';
import { LiveFrame } from './LiveFrame';
import type { LiveMascotProps } from './types';
import { useLive, useScoped } from './useLive';

/**
 * vizi.loading B «Səkkiz çəkir»: Vızı flies a figure eight in place, x = A·sin t, y = B·sin 2t
 * (3.4s per loop, linear), leans into the direction, mirrors at the turning points (150ms) and
 * shows speed lines only on the fast stretches. Reduced motion: the still flying pose.
 */
export function LoadingVizi({ size, label, decorative, className }: LiveMascotProps) {
  const { rig, active } = useLive('ucur');
  const { width } = useWindowDimensions();
  const v = rig.v;
  const k = size / 200;
  // Half the width of the eight: 150pt at most, less on narrow screens (lab: 32% of the stage).
  const a = Math.min(150, width * 0.3) / k;
  const b = 62.5;
  const t = useSharedValue(0);

  useScoped(active, (S) => startLife(S, rig, { hover: 0, flap: 'fly' }));
  useEffect(() => {
    if (!active) return;
    t.set(0);
    t.set(withRepeat(withTiming(Math.PI * 2, { duration: 3400, easing: ease.none }), -1, false));
    setSpeed(rig, true);
    return () => {
      cancelAnimation(t);
      t.set(withTiming(0, { duration: 200 }));
      setSpeed(rig, false);
    };
  }, [active, rig, t]);

  useAnimatedReaction(
    () => t.value,
    (now) => {
      v.hostX.set(a * Math.sin(now));
      v.hostY.set(b * Math.sin(2 * now));
    },
  );
  useAnimatedReaction(
    () => (Math.cos(t.value) >= 0 ? 1 : -1),
    (dir, prev) => {
      if (dir === prev) return;
      v.hostFlip.set(withTiming(dir, { duration: 150, easing: ease.p1io }));
      v.hostRot.set(-10 * dir);
    },
  );
  useAnimatedReaction(
    () => Math.abs(Math.cos(t.value)) > 0.55,
    (fast, prev) => {
      if (fast !== prev) v.speedOp.set(withTiming(fast ? 1 : 0, { duration: 150 }));
    },
  );

  return (
    <LiveFrame
      width={size}
      height={size}
      label={label}
      decorative={decorative}
      className={className}
    >
      <ViziRig rig={rig} size={size} speedLines />
    </LiveFrame>
  );
}
