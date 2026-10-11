// Design tokens: the single source of truth for colors, radii, typography and motion.
// Consumed by the Tailwind preset (className styling) and by apps/mobile/src/theme
// (places that need raw values, e.g. navigation theme, icons, animated styles).

/** Raw palette. Never reference these from components; use semantic colors. */
const palette = {
  indigo50: '#EEF2FF',
  indigo100: '#E0E7FF',
  indigo200: '#C7D2FE',
  indigo300: '#A5B4FC',
  indigo400: '#818CF8',
  indigo500: '#6366F1',
  indigo600: '#4F46E5',
  indigo700: '#4338CA',
  indigo950: '#1E1B4B',
  orange400: '#FB923C',
  orange600: '#EA580C',
  red400: '#F87171',
  red600: '#DC2626',
  green400: '#4ADE80',
  green700: '#15803D',
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A',
  slate950: '#020617',
  white: '#FFFFFF',
  black: '#000000',
};

/**
 * Semantic colors per color scheme. Keys become Tailwind color names
 * (e.g. `bg-background`, `text-foreground`, `border-border`).
 */
const colors = {
  light: {
    background: palette.slate50,
    foreground: palette.slate900,
    card: palette.white,
    'card-foreground': palette.slate900,
    muted: palette.slate100,
    'muted-foreground': palette.slate600,
    border: palette.slate200,
    input: palette.slate500,
    primary: palette.indigo600,
    'primary-foreground': palette.white,
    'primary-pressed': palette.indigo700,
    secondary: palette.indigo50,
    'secondary-foreground': palette.indigo700,
    accent: palette.orange600,
    'accent-foreground': palette.black,
    success: palette.green700,
    'success-foreground': palette.white,
    destructive: palette.red600,
    'destructive-foreground': palette.white,
    ring: palette.indigo600,
  },
  dark: {
    background: palette.slate950,
    foreground: palette.slate50,
    card: palette.slate900,
    'card-foreground': palette.slate50,
    muted: palette.slate800,
    'muted-foreground': palette.slate400,
    border: palette.slate800,
    input: palette.slate500,
    primary: palette.indigo400,
    'primary-foreground': palette.slate950,
    'primary-pressed': palette.indigo300,
    secondary: palette.indigo950,
    'secondary-foreground': palette.indigo200,
    accent: palette.orange400,
    'accent-foreground': palette.black,
    success: palette.green400,
    'success-foreground': palette.slate950,
    destructive: palette.red400,
    'destructive-foreground': palette.slate950,
    ring: palette.indigo400,
  },
};

/** Corner radii in points. */
const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

/** Type scale: [fontSize, lineHeight] in points. Body is 16 for readability. */
const fontSize = {
  xs: [12, 16],
  sm: [14, 20],
  base: [16, 24],
  lg: [18, 28],
  xl: [20, 28],
  '2xl': [24, 32],
  '3xl': [30, 36],
};

/** Minimum touch target (iOS 44pt; Android 48dp is covered by padding/hitSlop). */
const touchTarget = 48;

/** Motion durations in milliseconds. */
const duration = {
  fast: 150,
  normal: 250,
  slow: 350,
};

module.exports = { palette, colors, radius, fontSize, touchTarget, duration };
