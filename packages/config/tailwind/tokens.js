// Design tokens: the single source of truth for colors, radii, typography and motion.
// Consumed by the Tailwind preset (className styling) and by apps/mobile/src/theme
// (places that need raw values, e.g. navigation theme, icons, SVG, animated styles).
//
// Style: "Kobalt" (design A1) — calm, clean study app: cool grey ground, white cards with
// hairline borders, one cobalt accent, green/red answer feedback, orange for streaks. Flat
// controls (no 3D edges); the `*-shadow` colors are the darker tone of each fill.

/**
 * Semantic colors per color scheme. Keys become Tailwind color names
 * (e.g. `bg-background`, `text-foreground`, `border-primary-shadow`).
 * Contrast is checked by `pnpm --filter @mytutor/config test`.
 */
const colors = {
  light: {
    background: '#F5F7FB',
    foreground: '#0E1726',
    card: '#FFFFFF',
    'card-foreground': '#0E1726',
    muted: '#EEF1F6',
    'muted-foreground': '#566173',
    border: '#E3E8F0',
    input: '#7A8598',
    primary: '#1D4ED8',
    'primary-foreground': '#FFFFFF',
    'primary-pressed': '#1E40AF',
    'primary-shadow': '#1E3A8A',
    secondary: '#EAF0FF',
    'secondary-foreground': '#1D4ED8',
    accent: '#EA580C',
    'accent-foreground': '#0E1726',
    'accent-muted': '#FFF4E0',
    success: '#0F7A4E',
    'success-foreground': '#FFFFFF',
    'success-muted': '#E5F5EC',
    'success-shadow': '#0B5E3C',
    destructive: '#B42318',
    'destructive-foreground': '#FFFFFF',
    'destructive-muted': '#FDECEA',
    'destructive-shadow': '#8F1C13',
    ring: '#1D4ED8',
  },
  dark: {
    background: '#0A1020',
    foreground: '#E9EEF7',
    card: '#121A2C',
    'card-foreground': '#E9EEF7',
    muted: '#1B2437',
    'muted-foreground': '#9BA7BB',
    border: '#253047',
    input: '#6E7B95',
    primary: '#7AA0FF',
    'primary-foreground': '#0A1020',
    'primary-pressed': '#A5C0FF',
    'primary-shadow': '#2F55C9',
    secondary: '#182A55',
    'secondary-foreground': '#C9D8FF',
    accent: '#FB923C',
    'accent-foreground': '#1C0D02',
    'accent-muted': '#3A230F',
    success: '#3FC98A',
    'success-foreground': '#04251A',
    'success-muted': '#0E2D22',
    'success-shadow': '#157A55',
    destructive: '#F47C72',
    'destructive-foreground': '#2A0907',
    'destructive-muted': '#3A1614',
    'destructive-shadow': '#B42318',
    ring: '#7AA0FF',
  },
};

/** Corner radii in points. */
const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
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

/**
 * Font family names as registered with expo-font. Plus Jakarta Sans stands in for the design's
 * Manrope, which has no "Ə" or "₼"; it covers every Azerbaijani letter.
 */
const fontFamily = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  black: 'PlusJakartaSans_800ExtraBold',
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
