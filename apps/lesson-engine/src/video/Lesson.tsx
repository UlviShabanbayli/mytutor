import { AbsoluteFill } from 'remotion';
import type { PreparedLesson } from '../prepare/types';
import { Captions } from './Captions';
import { Chalk } from './Chalk';
import { HatchFill } from './HatchFill';
import { StrokeAction } from './StrokeAction';
import { FONT_FAMILY, THEMES } from './theme';

export type LessonProps = { lesson: PreparedLesson };

export function Lesson({ lesson }: LessonProps) {
  const theme = THEMES[lesson.theme];
  const label = {
    position: 'absolute',
    top: 36,
    fontFamily: FONT_FAMILY,
    fontSize: 26,
    color: theme.muted,
  } as const;

  return (
    <AbsoluteFill style={{ background: theme.board }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, transparent 55%, ${theme.vignette})`,
        }}
      />
      <svg viewBox="0 0 1920 1080" width="100%" height="100%">
        <defs>
          {/* Rough edges, like chalk dragged over a board. */}
          <filter id="chalk">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="3" />
            <feDisplacementMap in="SourceGraphic" scale="2.2" />
          </filter>
        </defs>
        <g filter="url(#chalk)">
          {lesson.actions.map((a) =>
            a.kind === 'hatch' ? (
              <HatchFill key={a.id} action={a} color={theme.ink[a.color]} />
            ) : (
              <StrokeAction key={a.id} action={a} color={theme.ink[a.color]} />
            ),
          )}
        </g>
        <Chalk actions={lesson.actions} color={theme.ink.chalk} />
      </svg>
      <div style={{ ...label, left: 48 }}>{lesson.title}</div>
      <div style={{ ...label, right: 48 }}>{lesson.source}</div>
      <Captions steps={lesson.steps} background={theme.caption} color={theme.captionText} />
    </AbsoluteFill>
  );
}
