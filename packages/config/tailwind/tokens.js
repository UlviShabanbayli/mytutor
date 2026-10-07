// Design tokens: the single source of truth for colors, radii, typography and motion.
// Consumed by the Tailwind preset (className styling) and by apps/mobile/src/theme
// (places that need raw values, e.g. navigation theme, icons, SVG, animated styles).
//
// Style: "tactile study" — violet brand, rounded surfaces, chunky 3D buttons
// (a darker `*-shadow` bottom edge), green/red answer feedback, amber for streaks.

/**
 * Semantic colors per color scheme. Keys become Tailwind color names
 * (e.g. `bg-background`, `text-foreground`, `border-primary-shadow`).
 * Contrast is checked by `pnpm --filter @mytutor/config test`.
 */
const colors = {
  light: {
    background: '#F7F5FC',
    foreground: '#1A1530',
    card: '#FFFFFF',
    'card-foreground': '#1A1530',
    muted: '#EFEBF8',
    'muted-foreground': '#5B5675',
    border: '#E4DEF2',
    input: '#857F9E',
    primary: '#7C3AED',
    'primary-foreground': '#FFFFFF',
    'primary-pressed': '#6D28D9',
    'primary-shadow': '#5B21B6',
    secondary: '#EDE9FE',
    'secondary-foreground': '#5B21B6',
    accent: '#F59E0B',
    'accent-foreground': '#1A1530',
    'accent-muted': '#FEF3C7',
    success: '#15803D',
    'success-foreground': '#FFFFFF',
    'success-muted': '#DCFCE7',
    'success-shadow': '#166534',
    destructive: '#C81E1E',
    'destructive-foreground': '#FFFFFF',
    'destructive-muted': '#FEE2E2',
    'destructive-shadow': '#991B1B',
    ring: '#7C3AED',
  },
  dark: {
    background: '#0E0B1A',
    foreground: '#F5F3FF',
    card: '#1A1530',
    'card-foreground': '#F5F3FF',
    muted: '#241E3D',
    'muted-foreground': '#A9A3C4',
    border: '#2E2750',
    input: '#77719A',
    primary: '#A78BFA',
    'primary-foreground': '#1A1030',
    'primary-pressed': '#C4B5FD',
    'primary-shadow': '#6D28D9',
    secondary: '#2E1F5E',
    'secondary-foreground': '#DDD6FE',
    accent: '#FBBF24',
    'accent-foreground': '#1A1530',
    'accent-muted': '#3A2A0A',
    success: '#4ADE80',
    'success-foreground': '#052E16',
    'success-muted': '#10301E',
    'success-shadow': '#15803D',
    destructive: '#F87171',
    'destructive-foreground': '#2A0A0A',
    'destructive-muted': '#3A1418',
    'destructive-shadow': '#B91C1C',
    ring: '#A78BFA',
  },
};

/** Corner radii in points. */
const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
};

/** Type scale: [fontSize, lineHeight] in points. Body is 16 for readability. */
const fontSize = {
  xs: [12, 16],
  sm: [14, 20],
  base: [16, 24],
  lg: [18, 26],
  xl: [20, 28],
  '2xl': [24, 32],
  '3xl': [30, 38],
  '4xl': [40, 48],
};

/** Font family names as registered with expo-font (Nunito covers all Azerbaijani letters). */
const fontFamily = {
  regular: 'Nunito_400Regular',
  medium: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  black: 'Nunito_900Black',
};

/** Minimum touch target (iOS 44pt; 48 also satisfies Android's 48dp). */
const touchTarget = 48;

/** Motion durations in milliseconds. */
const duration = {
  fast: 150,
  normal: 250,
  slow: 350,
};

module.exports = { colors, radius, fontSize, fontFamily, touchTarget, duration };
