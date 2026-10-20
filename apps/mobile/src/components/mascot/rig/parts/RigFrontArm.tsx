import { useAnimatedProps } from 'react-native-reanimated';
import { VIZI } from '../data/colors';
import { ARM_R } from '../data/poses';
import { apply, applyX, applyY, compose, propMatrix, quad, rotateAbout } from '../geometry';
import type { RigValues } from '../rigValues';
import { ACircle, AG, APath } from './animated';

type RigFrontArmProps = { v: RigValues };

const STICK = { stroke: VIZI.stick, strokeLinecap: 'round', fill: 'none' } as const;

/**
 * The right arm drawn over the face (hand on the chin, the magnifier of the scout, the big lens)
 * with its props. Turns at the shoulder by `frontRot` (the lens wiggle).
 */
export function RigFrontArm({ v }: RigFrontArmProps) {
  const group = useAnimatedProps(() => ({ opacity: v.front.value }));
  const arm = useAnimatedProps(() => ({
    d: quad(v.armR.value, rotateAbout(v.frontRot.value, 170, 112)),
  }));
  const magStick = useAnimatedProps(() => {
    const m = compose(
      rotateAbout(v.frontRot.value, 170, 112),
      propMatrix(v.armR.value, ARM_R.hold),
    );
    return {
      d: `M${apply(m, 190, 144)} L${apply(m, 199, 162)}`,
      opacity: v.magOp.value,
    };
  });
  const magGlass = useAnimatedProps(() => {
    const m = compose(
      rotateAbout(v.frontRot.value, 170, 112),
      propMatrix(v.armR.value, ARM_R.hold),
    );
    return { cx: applyX(m, 212, 190), cy: applyY(m, 212, 190), opacity: v.magOp.value };
  });
  const magShine = useAnimatedProps(() => {
    const m = compose(
      rotateAbout(v.frontRot.value, 170, 112),
      propMatrix(v.armR.value, ARM_R.hold),
    );
    return {
      d: `M${apply(m, 196, 182)} Q${apply(m, 199, 170)} ${apply(m, 210, 168)}`,
      opacity: v.magOp.value,
    };
  });
  const lens = useAnimatedProps(() => {
    const m = compose(
      rotateAbout(v.frontRot.value, 170, 112),
      propMatrix(v.armR.value, ARM_R.lens),
    );
    return {
      d: `M${apply(m, 150, 140)} L${apply(m, 178, 168)}`,
      opacity: v.lensOp.value,
    };
  });
  const lensGlass = useAnimatedProps(() => {
    const m = compose(
      rotateAbout(v.frontRot.value, 170, 112),
      propMatrix(v.armR.value, ARM_R.lens),
    );
    return { cx: applyX(m, 126, 94), cy: applyY(m, 126, 94), opacity: v.lensOp.value };
  });
  const lensPupil = useAnimatedProps(() => {
    const m = compose(
      rotateAbout(v.frontRot.value, 170, 112),
      propMatrix(v.armR.value, ARM_R.lens),
    );
    return { cx: applyX(m, 128, 98), cy: applyY(m, 128, 98), opacity: v.lensOp.value };
  });
  const lensGlint = useAnimatedProps(() => {
    const m = compose(
      rotateAbout(v.frontRot.value, 170, 112),
      propMatrix(v.armR.value, ARM_R.lens),
    );
    return { cx: applyX(m, 136, 89), cy: applyY(m, 136, 89), opacity: v.lensOp.value };
  });

  return (
    <AG animatedProps={group}>
      <APath animatedProps={magStick} strokeWidth={7} {...STICK} />
      <ACircle
        animatedProps={magGlass}
        r={28}
        fill={VIZI.white}
        fillOpacity={0.35}
        stroke={VIZI.lens}
        strokeWidth={7}
      />
      <APath
        animatedProps={magShine}
        stroke={VIZI.white}
        strokeWidth={3.5}
        strokeLinecap="round"
        fill="none"
      />
      <APath animatedProps={lens} strokeWidth={10} {...STICK} />
      <ACircle
        animatedProps={lensGlass}
        r={34}
        fill={VIZI.white}
        stroke={VIZI.lens}
        strokeWidth={8}
      />
      <ACircle animatedProps={lensPupil} r={19} fill={VIZI.pupil} />
      <ACircle animatedProps={lensGlint} r={6.5} fill={VIZI.white} />
      <APath
        animatedProps={arm}
        stroke={VIZI.ink}
        strokeWidth={11}
        strokeLinecap="round"
        fill="none"
      />
    </AG>
  );
}
