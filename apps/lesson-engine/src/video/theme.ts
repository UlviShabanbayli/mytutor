import type { LessonColor } from '@mytutor/types';
import type { PreparedLesson } from '../prepare/types';

type Theme = {
  board: string;
  vignette: string;
  ink: Record<LessonColor, string>;
  caption: string;
  captionText: string;
  muted: string;
};

export const THEMES: Record<PreparedLesson['theme'], Theme> = {
  blackboard: {
    board: '#1F2D27',
    vignette: 'rgba(0, 0, 0, 0.45)',
    ink: {
      chalk: '#F3F0E7',
      yellow: '#F7D66E',
      pink: '#F5A7C7',
      blue: '#9ACBFB',
      green: '#A9E6A4',
      orange: '#F8B66F',
    },
    caption: 'rgba(8, 12, 10, 0.72)',
    captionText: '#FFFFFF',
    muted: 'rgba(243, 240, 231, 0.6)',
  },
  whiteboard: {
    board: '#FBFBF8',
    vignette: 'rgba(0, 0, 0, 0.06)',
    ink: {
      chalk: '#1F2937',
      yellow: '#C2410C',
      pink: '#BE185D',
      blue: '#1D4ED8',
      green: '#15803D',
      orange: '#B45309',
    },
    caption: 'rgba(17, 24, 39, 0.82)',
    captionText: '#FFFFFF',
    muted: 'rgba(31, 41, 55, 0.55)',
  },
};

export const FONT_FAMILY = 'Nunito';
