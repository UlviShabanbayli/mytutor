export type KnobShape = { translateX: number; scaleX: number; scaleY: number };

/**
 * buttons.switch B: where the knob is and how it is stretched for a spring value `x`
 * (0 = off, `travel` = on; the spring may overshoot either end). While travelling the knob
 * stretches up to 25% (sin of the progress); past an end it squashes against it instead of
 * overshooting. It scales about the edge it is heading to, so that edge stays put.
 */
export function knobShape(x: number, travel: number, knob: number, on: boolean): KnobShape {
  'worklet';
  const pos = Math.min(Math.max(x, 0), travel);
  const over = Math.abs(x - pos);
  const progress = travel > 0 ? pos / travel : 0;
  const stretch = 1 + 0.25 * Math.sin(Math.PI * progress);
  const scaleX = stretch * Math.max(0.5, 1 - over / knob);
  const scaleY = 1 + over / (2 * knob);
  // RN scales about the centre; shift by half the growth to pin the leading edge.
  const shift = ((scaleX - 1) * knob) / 2;
  return { translateX: on ? pos - shift : pos + shift, scaleX, scaleY };
}
