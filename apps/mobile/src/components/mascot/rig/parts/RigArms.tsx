import { useAnimatedProps } from 'react-native-reanimated';
import { VIZI } from '../data/colors';
import { ARM_R } from '../data/poses';
import { apply, compose, propMatrix, quad, rotateAbout } from '../geometry';
import type { RigValues } from '../rigValues';
import { APath } from './animated';

type RigArmsProps = { v: RigValues };

const ARM = { stroke: VIZI.ink, strokeWidth: 11, strokeLinecap: 'round', fill: 'none' } as const;

/**
 * Both arms behind the body, turning at the shoulders (30,118) and (170,112), and the pointer
 * stick held in the right hand. The right arm hides when it is drawn in front (RigFrontArm).
 */
export function RigArms({ v }: RigArmsProps) {
  const left = useAnimatedProps(() => ({
    d: quad(v.armL.value, rotateAbout(v.armLRot.value, 30, 118)),
  }));
  const right = useAnimatedProps(() => ({
    d: quad(v.armR.value, rotateAbout(v.armRRot.value, 170, 112)),
    opacity: 1 - v.front.value,
  }));
  const pointer = useAnimatedProps(() => {
    const m = compose(
      rotateAbout(v.armRRot.value, 170, 112),
      propMatrix(v.armR.value, ARM_R.point),
    );
    return { d: `M${apply(m, 198, 104)} L${apply(m, 262, 94)}`, opacity: v.pointerOp.value };
  });

  return (
    <>
      <APath animatedProps={left} {...ARM} />
      <APath
        animatedProps={pointer}
        stroke={VIZI.stick}
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
      <APath animatedProps={right} {...ARM} />
    </>
  );
}
