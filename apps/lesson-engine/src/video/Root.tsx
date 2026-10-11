import { loadFont } from '@remotion/fonts';
import { Composition, staticFile } from 'remotion';
import type { PreparedLesson } from '../prepare/types';
import { Lesson, type LessonProps } from './Lesson';
import { FONT_FAMILY } from './theme';

// Copied into public/fonts by scripts/render.ts.
void loadFont({
  family: FONT_FAMILY,
  url: staticFile('fonts/Nunito_600SemiBold.ttf'),
  weight: '600',
});

const EMPTY: PreparedLesson = {
  fps: 30,
  durationInFrames: 30,
  theme: 'blackboard',
  title: '',
  source: '',
  steps: [],
  actions: [],
};

export function Root() {
  return (
    <Composition
      id="Lesson"
      component={Lesson}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={30}
      defaultProps={{ lesson: EMPTY } satisfies LessonProps}
      calculateMetadata={({ props }) => ({
        durationInFrames: props.lesson.durationInFrames,
        fps: props.lesson.fps,
      })}
    />
  );
}
