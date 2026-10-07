import { getPointAtLength } from '@remotion/paths';
import { useCurrentFrame } from 'remotion';
import type { PreparedAction } from '../prepare/types';
import { actionProgress, pathProgress } from './progress';

type ChalkProps = {
  actions: PreparedAction[];
  color: string;
};

/** A chalk stick that follows the point being drawn; hidden between actions. */
export function Chalk({ actions, color }: ChalkProps) {
  const frame = useCurrentFrame();
  const active = actions.find((a) => frame >= a.from && frame < a.to);
  if (!active) return null;

  const progress = actionProgress(frame, active.from, active.to);
  let point: { x: number; y: number } | null;
  if (active.kind === 'hatch') {
    point = {
      x: active.box.x + active.box.width * progress,
      y: active.box.y + active.box.height * (0.3 + 0.4 * ((frame % 8) / 8)),
    };
  } else {
    const parts = pathProgress(active.paths, progress, active.from, active.to);
    const current =
      parts.find((p) => p.progress > 0 && p.progress < 1) ??
      parts.findLast((p) => p.progress > 0) ??
      parts[0];
    if (!current) return null;
    point = getPointAtLength(current.path.d, current.path.length * current.progress);
  }
  if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return null;

  return (
    <g transform={`translate(${point.x} ${point.y}) rotate(35)`}>
      <rect
        x={-2}
        y={-9}
        width={86}
        height={18}
        rx={6}
        fill="rgba(0,0,0,0.35)"
        transform="translate(6 8)"
      />
      <rect x={0} y={-9} width={86} height={18} rx={6} fill={color} />
      <rect x={0} y={-9} width={10} height={18} rx={4} fill="rgba(0,0,0,0.12)" />
    </g>
  );
}
