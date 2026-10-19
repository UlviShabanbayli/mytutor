import { useAnimatedProps } from 'react-native-reanimated';
import { VIZI } from '../data/colors';
import { quad } from '../geometry';
import type { RigValues } from '../rigValues';
import { AEllipse, AG, APath } from './animated';

type RigMouthProps = { v: RigValues };

/** The three mouths (a line, an open mouth with a tongue, an "o"), cross-faded while morphing. */
export function RigMouth({ v }: RigMouthProps) {
  const line = useAnimatedProps(() => ({ d: quad(v.mL.value), opacity: v.mLop.value }));
  const open = useAnimatedProps(() => ({ opacity: v.mOop.value }));
  const lips = useAnimatedProps(() => ({ d: `${quad(v.mO.value)} Z` }));
  const tongue = useAnimatedProps(() => ({ d: `${quad(v.mT.value)} Z` }));
  const o = useAnimatedProps(() => {
    const e = v.mE.value;
    return {
      cx: e[0] ?? 100,
      cy: e[1] ?? 130,
      rx: Math.max(0.1, e[2] ?? 0),
      ry: Math.max(0.1, e[3] ?? 0),
      opacity: v.mEop.value,
    };
  });

  return (
    <>
      <APath
        animatedProps={line}
        stroke={VIZI.ink}
        strokeWidth={5.5}
        strokeLinecap="round"
        fill="none"
      />
      <AG animatedProps={open}>
        <APath animatedProps={lips} fill={VIZI.ink} />
        <APath animatedProps={tongue} fill={VIZI.tongue} />
      </AG>
      <AEllipse animatedProps={o} fill={VIZI.ink} />
    </>
  );
}
