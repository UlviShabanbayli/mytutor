import { interpolate, useCurrentFrame } from 'remotion';
import type { PreparedStep } from '../prepare/types';
import { FONT_FAMILY } from './theme';

type CaptionsProps = {
  steps: PreparedStep[];
  background: string;
  color: string;
};

/** Narration as subtitles: shown even with voice-over, for sound-off viewing. */
export function Captions({ steps, background, color }: CaptionsProps) {
  const frame = useCurrentFrame();
  const step = steps.find((s) => frame >= s.from && frame < s.to + 8);
  if (!step) return null;
  const opacity = interpolate(
    frame,
    [step.from, step.from + 6, step.to, step.to + 8],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: 160,
        right: 160,
        bottom: 56,
        display: 'flex',
        justifyContent: 'center',
        opacity,
      }}
    >
      <div
        style={{
          background,
          color,
          fontFamily: FONT_FAMILY,
          fontWeight: 600,
          fontSize: 40,
          lineHeight: 1.35,
          padding: '14px 28px',
          borderRadius: 18,
          textAlign: 'center',
        }}
      >
        {step.narration}
      </div>
    </div>
  );
}
