import { useCurrentFrame } from 'remotion';
import type { PreparedAction } from '../prepare/types';
import { actionProgress } from './progress';

type HatchFillProps = {
  action: Extract<PreparedAction, { kind: 'hatch' }>;
  color: string;
};

/** Diagonal chalk hatching over an area, revealed left to right. */
export function HatchFill({ action, color }: HatchFillProps) {
  const frame = useCurrentFrame();
  if (frame < action.from) return null;
  const progress = actionProgress(frame, action.from, action.to);
  const { x, y, width, height } = action.box;
  const patternId = `hatch-${action.id}`;
  const clipId = `clip-${action.id}`;

  return (
    <g>
      <defs>
        <pattern
          id={patternId}
          width="16"
          height="16"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="16" stroke={color} strokeWidth="5" strokeOpacity="0.45" />
        </pattern>
        <clipPath id={clipId}>
          <rect x={x} y={y} width={width * progress} height={height} />
        </clipPath>
      </defs>
      <rect
        x={x + 6}
        y={y + 6}
        width={width - 12}
        height={height - 12}
        fill={`url(#${patternId})`}
        clipPath={`url(#${clipId})`}
      />
    </g>
  );
}
