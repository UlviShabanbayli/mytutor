import { useAnimatedProps } from 'react-native-reanimated';
import { VIZI } from '../data/colors';
import type { RigValues } from '../rigValues';
import { AEllipse, AG } from './animated';

type RigCheeksProps = { v: RigValues };

/** Blushing cheeks; they grow when Vızı giggles or winks. */
export function RigCheeks({ v }: RigCheeksProps) {
  const group = useAnimatedProps(() => ({ opacity: v.cheekOp.value }));
  // One animated-props object per shape (Reanimated binds each to a single view).
  const left = useAnimatedProps(() => ({ rx: 10 * v.cheekS.value, ry: 7 * v.cheekS.value }));
  const right = useAnimatedProps(() => ({ rx: 10 * v.cheekS.value, ry: 7 * v.cheekS.value }));

  return (
    <AG animatedProps={group}>
      <AEllipse animatedProps={left} cx={48} cy={122} fill={VIZI.cheek} />
      <AEllipse animatedProps={right} cx={152} cy={122} fill={VIZI.cheek} />
    </AG>
  );
}
