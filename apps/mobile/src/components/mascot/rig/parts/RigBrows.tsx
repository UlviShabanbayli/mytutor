import { useAnimatedProps } from 'react-native-reanimated';
import { VIZI } from '../data/colors';
import { quad } from '../geometry';
import type { RigValues } from '../rigValues';
import { AG, APath } from './animated';

type RigBrowsProps = { v: RigValues };

const BROW = { stroke: VIZI.ink, strokeWidth: 7, strokeLinecap: 'round', fill: 'none' } as const;

/** Brows: shown only by faces that have them (thinking, explaining, surprise, comfort). */
export function RigBrows({ v }: RigBrowsProps) {
  const group = useAnimatedProps(() => ({ opacity: v.browOp.value }));
  const left = useAnimatedProps(() => ({ d: quad(v.browL.value) }));
  const right = useAnimatedProps(() => ({ d: quad(v.browR.value) }));

  return (
    <AG animatedProps={group}>
      <APath animatedProps={left} {...BROW} />
      <APath animatedProps={right} {...BROW} />
    </AG>
  );
}
