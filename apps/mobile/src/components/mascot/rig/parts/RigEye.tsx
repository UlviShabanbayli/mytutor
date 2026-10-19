import { useAnimatedProps } from 'react-native-reanimated';
import { Circle, ClipPath, Defs, G } from 'react-native-svg';
import { VIZI } from '../data/colors';
import { fmt } from '../geometry';
import type { RigValues } from '../rigValues';
import { ACircle, APath } from './animated';

type RigEyeProps = { v: RigValues; side: 'L' | 'R'; clipId: string };

/**
 * One eye (motion lab `eye()`): the white, the pupil with its glint, the upper lid (slides down
 * and slants), the lower lid (happy squint) and the closed-eye lash, all scaled by `eye`.
 */
export function RigEye({ v, side, clipId }: RigEyeProps) {
  const left = side === 'L';
  const cx = left ? 76 : 124;
  const px = left ? 79 : 121;
  const blink = left ? v.blinkL : v.blinkR;
  const pbX = left ? v.pbLX : v.pbRX;
  const pbY = left ? v.pbLY : v.pbRY;
  const turn = left ? 1 : -1;

  const white = useAnimatedProps(() => ({ r: 25 * v.eye.value }));
  // Pupil centre and glint: pose offset + glance + dizzy orbit, scaled about the eye centre.
  const pupil = useAnimatedProps(() => {
    const k = Math.sin(Math.min(1, v.dizzy.value / (Math.PI * 4)) * Math.PI) * 6;
    const ox = pbX.value + v.lookX.value + turn * k * Math.cos(v.dizzy.value);
    const oy = pbY.value + v.lookY.value + turn * k * Math.sin(v.dizzy.value);
    const e = v.eye.value;
    return { cx: cx + (px + ox - cx) * e, cy: 90 + (94 + oy - 90) * e, r: 13 * v.pupS.value * e };
  });
  const glint = useAnimatedProps(() => {
    const k = Math.sin(Math.min(1, v.dizzy.value / (Math.PI * 4)) * Math.PI) * 6;
    const s = v.pupS.value;
    const ox = pbX.value + v.lookX.value + turn * k * Math.cos(v.dizzy.value) + 5 * s;
    const oy = pbY.value + v.lookY.value + turn * k * Math.sin(v.dizzy.value) - 6 * s;
    const e = v.eye.value;
    return { cx: cx + (px + ox - cx) * e, cy: 90 + (94 + oy - 90) * e, r: 4.5 * s * e };
  });
  const lid = useAnimatedProps(() => {
    const e = v.eye.value;
    const y = v.lidY.value + (24 - v.lidY.value) * blink.value;
    const r = (turn * v.slant.value * Math.PI) / 180;
    const c = Math.cos(r);
    const s = Math.sin(r);
    const p = (x: number, yy: number) => {
      const dx = x - cx;
      const dy = yy - 90;
      return `${fmt(cx + (dx * c - dy * s) * e)} ${fmt(90 + (dx * s + dy * c + y) * e)}`;
    };
    return {
      d: `M${p(cx - 34, 14)} L${p(cx + 34, 14)} L${p(cx + 34, 93)} Q${p(cx, 101)} ${p(cx - 34, 93)} Z`,
    };
  });
  const low = useAnimatedProps(() => {
    const e = v.eye.value;
    const p = (x: number, y: number) =>
      `${fmt(cx + (x - cx) * e)} ${fmt(90 + (y + v.low.value - 90) * e)}`;
    return {
      d: `M${p(cx - 32, 106)} Q${p(cx, 84)} ${p(cx + 32, 106)} L${p(cx + 32, 136)} L${p(cx - 32, 136)} Z`,
    };
  });
  const lash = useAnimatedProps(() => {
    const e = v.eye.value;
    const p = (x: number, y: number) => `${fmt(cx + (x - cx) * e)} ${fmt(90 + (y - 90) * e)}`;
    return {
      d: `M${p(cx - 21, 101)} Q${p(cx, 111)} ${p(cx + 21, 101)}`,
      opacity: Math.max(v.lash.value, blink.value > 0.9 ? 1 : 0),
    };
  });

  return (
    <>
      <Defs>
        <ClipPath id={clipId}>
          <Circle cx={cx} cy={90} r={25.5} />
        </ClipPath>
      </Defs>
      <ACircle animatedProps={white} cx={cx} cy={90} fill={VIZI.white} />
      <ACircle animatedProps={pupil} fill={VIZI.pupil} />
      <ACircle animatedProps={glint} fill={VIZI.white} />
      <G clipPath={`url(#${clipId})`}>
        <APath animatedProps={low} fill={VIZI.body} />
        <APath
          animatedProps={lid}
          fill={VIZI.body}
          stroke={VIZI.ink}
          strokeWidth={4.5}
          strokeLinejoin="round"
        />
      </G>
      <APath
        animatedProps={lash}
        stroke={VIZI.ink}
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
    </>
  );
}
