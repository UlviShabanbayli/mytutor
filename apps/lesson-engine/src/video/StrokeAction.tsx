import { interpolate, useCurrentFrame } from 'remotion';
import type { PreparedAction } from '../prepare/types';
import { actionProgress, pathProgress } from './progress';

type StrokeActionProps = {
  action: Extract<PreparedAction, { kind: 'stroke' }>;
  color: string;
};

/** Draws each path like chalk on the board; text glyphs fill in right after their outline. */
export function StrokeAction({ action, color }: StrokeActionProps) {
  const frame = useCurrentFrame();
  if (frame < action.from) return null;
  const parts = pathProgress(
    action.paths,
    actionProgress(frame, action.from, action.to),
    action.from,
    action.to,
  );

  return (
    <g>
      {parts.map(({ path, progress, doneAt }, i) =>
        progress <= 0 ? null : (
          <g key={i}>
            <path
              d={path.d}
              fill={action.filled ? color : 'none'}
              fillOpacity={
                action.filled
                  ? interpolate(frame, [doneAt, doneAt + 5], [0, 1], {
                      extrapolateLeft: 'clamp',
                      extrapolateRight: 'clamp',
                    })
                  : 0
              }
              stroke={color}
              strokeWidth={action.filled ? 2.2 : 6}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={path.length}
              strokeDashoffset={path.length * (1 - progress)}
            />
          </g>
        ),
      )}
    </g>
  );
}
