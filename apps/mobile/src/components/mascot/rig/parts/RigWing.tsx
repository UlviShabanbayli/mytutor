import { useAnimatedProps } from 'react-native-reanimated';
import { VIZI } from '../data/colors';
import { applyX, applyY, ellipse, rotateAbout } from '../geometry';
import type { RigValues } from '../rigValues';
import { APath } from './animated';

type RigWingProps = { v: RigValues; side: 'L' | 'R' };

/** One wing: the ellipse, its highlight and the flight ghost, flapping around the wing root. */
export function RigWing({ v, side }: RigWingProps) {
  const left = side === 'L';
  const s = left ? 1 : -1;
  const px = left ? 64 : 136;
  const pose = left ? v.wingL : v.wingR;
  const flap = left ? v.flapL : v.flapR;

  const wing = useAnimatedProps(() => {
    const w = pose.value;
    const m = rotateAbout(flap.value, px, 66);
    const x = w[0] ?? 0;
    const y = w[1] ?? 0;
    return {
      d: ellipse(applyX(m, x, y), applyY(m, x, y), w[2] ?? 0, w[3] ?? 0, (w[4] ?? 0) + flap.value),
    };
  });
  const hi = useAnimatedProps(() => {
    const w = pose.value;
    const m = rotateAbout(flap.value, px, 66);
    const x = (w[0] ?? 0) + 4 * s;
    const y = (w[1] ?? 0) - 4;
    const rx = (w[2] ?? 0) * 0.5;
    const ry = (w[3] ?? 0) * 0.45;
    return { d: ellipse(applyX(m, x, y), applyY(m, x, y), rx, ry, (w[4] ?? 0) + flap.value) };
  });
  const ghost = useAnimatedProps(() => {
    const w = pose.value;
    const m = rotateAbout(flap.value, px, 66);
    const x = (w[0] ?? 0) - 6 * s;
    const y = (w[1] ?? 0) + 6;
    const turn = (w[4] ?? 0) + 40 * s + flap.value;
    return {
      d: ellipse(applyX(m, x, y), applyY(m, x, y), w[2] ?? 0, (w[3] ?? 0) * 0.9, turn),
      opacity: v.ghostOp.value,
    };
  });

  return (
    <>
      <APath animatedProps={ghost} fill={VIZI.wingGhost} />
      <APath animatedProps={wing} fill={VIZI.wing} />
      <APath animatedProps={hi} fill={VIZI.wingHi} />
    </>
  );
}
