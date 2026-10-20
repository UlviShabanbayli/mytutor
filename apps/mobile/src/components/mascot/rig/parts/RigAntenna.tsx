import { useAnimatedProps } from 'react-native-reanimated';
import { VIZI } from '../data/colors';
import { applyX, applyY, quad, rotateAbout } from '../geometry';
import type { RigValues } from '../rigValues';
import { ACircle, APath } from './animated';

type RigAntennaProps = { v: RigValues; side: 'L' | 'R' };

/** One antenna: the curve and its tip, wobbling around the base on the head. */
export function RigAntenna({ v, side }: RigAntennaProps) {
  const left = side === 'L';
  const pose = left ? v.antL : v.antR;
  const wob = left ? v.wobL : v.wobR;
  const px = left ? 86 : 114;

  const stalk = useAnimatedProps(() => ({ d: quad(pose.value, rotateAbout(wob.value, px, 38)) }));
  const tip = useAnimatedProps(() => {
    const a = pose.value;
    const m = rotateAbout(wob.value, px, 38);
    return { cx: applyX(m, a[6] ?? 0, a[7] ?? 0), cy: applyY(m, a[6] ?? 0, a[7] ?? 0) };
  });

  return (
    <>
      <APath
        animatedProps={stalk}
        stroke={VIZI.ink}
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
      />
      <ACircle animatedProps={tip} r={8} fill={VIZI.ink} />
    </>
  );
}
