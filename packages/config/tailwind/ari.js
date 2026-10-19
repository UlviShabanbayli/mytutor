// Design tokens and Tailwind preset of the arı mobile app: the design canvas "arı — tətbiq
// dizaynı", palette B "Ağ pətək" (white hive). The admin panel still uses ./tokens.js
// (Kobalt) until its own redesign.
//
// Light: cool white ground, white cards, honey as the one accent, ink-dark text.
// Dark: neutral near-black with the same honey. Primary buttons are honey with a darker
// honey edge underneath (0 4px 0 honey-deep). Every text pair is checked by
// `pnpm --filter @mytutor/config test`.

/**
 * Semantic colors per scheme. Keys become Tailwind color names (`bg-surf`, `text-muted`,
 * `border-honey`). `page` is the screen ground; `spot` is the inverted highlight card and
 * the centre "Soruş" button (never use `ink` as a background: it turns white in dark mode).
 * Mastery levels: `wax` empty, `nectar` learning, `honey` mastered, `sealed` + `cap`
 * reinforced, `crystal` needs practice.
 */
const palette = {
  light: {
    page: '#F6F7F9',
    surf: '#FFFFFF',
    raised: '#FFF5DB',
    box: '#EEF0F4',
    slat: '#FFFFFF',
    'slat-edge': '#DADDE5',
    ink: '#141824',
    muted: '#5A6170',
    border: '#E4E7EC',
    honey: '#FFB800',
    'honey-deep': '#D99A00',
    'honey-text': '#7E5600',
    nectar: '#FFE08A',
    'on-nectar': '#141824',
    wax: '#ECEEF2',
    cap: '#FFF3CC',
    'on-honey': '#141824',
    'lock-ink': '#626977',
    info: '#2560C4',
    'info-bg': '#E9F0FC',
    ok: '#0A7A4F',
    'ok-bg': '#E4F5EC',
    err: '#C42F38',
    'err-bg': '#FDECEC',
    crystal: '#E3EAF5',
    'crystal-ink': '#34507A',
    sealed: '#D99A00',
    'on-sealed': '#141824',
    spot: '#141824',
    'on-spot': '#FFFFFF',
    'spot-line': 'rgba(255,255,255,0.24)',
    shadow: 'rgba(20,24,36,0.08)',
    scrim: 'rgba(13,15,20,0.45)',
  },
  dark: {
    page: '#0D0F14',
    surf: '#171A21',
    raised: '#20242D',
    box: '#12151B',
    slat: '#1C2028',
    'slat-edge': '#2B303B',
    ink: '#F2F4F7',
    muted: '#A4ABB8',
    border: '#2A2F3A',
    honey: '#FFC233',
    'honey-deep': '#C99418',
    'honey-text': '#FFD466',
    nectar: '#6E5718',
    'on-nectar': '#FFF1C9',
    wax: '#2A2F3A',
    cap: '#FFE7A8',
    'on-honey': '#0D0F14',
    'lock-ink': '#9AA1AF',
    info: '#8DB4FF',
    'info-bg': '#182338',
    ok: '#4FD3A0',
    'ok-bg': '#11302A',
    err: '#FF8A80',
    'err-bg': '#3A1A1F',
    crystal: '#233049',
    'crystal-ink': '#B7CBF0',
    sealed: '#C99418',
    'on-sealed': '#0D0F14',
    spot: '#262B36',
    'on-spot': '#F2F4F7',
    'spot-line': 'rgba(255,255,255,0.24)',
    shadow: 'rgba(0,0,0,0.35)',
    scrim: 'rgba(0,0,0,0.6)',
  },
};

/** Corner radii in points: letter box 9, chip 10, field and option 14, button 16, card 20, sheet 28. */
const radius = {
  xs: 9,
  sm: 10,
  md: 14,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  full: 9999,
};

/**
 * Type scale: [fontSize, lineHeight] in points. `2xs` is the 11pt CAPS label (a t-shirt size, so
 * tailwind-merge in `cn` keeps it apart from text colors); body is 15;
 * card titles 17; screen titles 28 (Unbounded).
 */
const fontSize = {
  '2xs': [11, 14],
  xs: [12, 16],
  sm: [13, 18],
  base: [15, 21],
  md: [17, 23],
  lg: [20, 26],
  xl: [22, 28],
  '2xl': [24, 30],
  '3xl': [28, 34],
  '4xl': [36, 42],
};

/**
 * Font family names as registered with expo-font. Onest is the UI face, Unbounded the display
 * face (titles, big numbers); both cover Azerbaijani and Cyrillic letters and "₼".
 */
const fontFamily = {
  regular: 'Onest_400Regular',
  medium: 'Onest_500Medium',
  semibold: 'Onest_600SemiBold',
  bold: 'Onest_700Bold',
  black: 'Onest_800ExtraBold',
  display: 'Unbounded_600SemiBold',
  'display-bold': 'Unbounded_700Bold',
  'display-black': 'Unbounded_800ExtraBold',
};

/** Minimum touch target (iOS 44pt; 48 also satisfies Android's 48dp). */
const touchTarget = 48;

/** Motion durations in milliseconds; `celebrate` is the lesson/unit done moment. */
const duration = {
  fast: 120,
  normal: 220,
  slow: 400,
  celebrate: 900,
};

const colorNames = Object.keys(palette.light);
const isHex = (value) => value.startsWith('#');

/** '#4F46E5' -> '79 70 229' (space-separated channels for `<alpha-value>` support). */
function hexToChannels(hex) {
  const value = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16)).join(' ');
}

/** CSS variable map for one scheme: { '--color-honey': '255 184 0', '--color-scrim': 'rgba(…)' }. */
function themeVars(scheme) {
  return Object.fromEntries(
    colorNames.map((name) => {
      const value = palette[scheme][name];
      return [`--color-${name}`, isHex(value) ? hexToChannels(value) : value];
    }),
  );
}

const px = (value) => `${value}px`;

/** @type {import('tailwindcss').Config} */
const preset = {
  theme: {
    extend: {
      // Hex tokens take Tailwind opacity modifiers (`bg-honey/20`); rgba tokens are used as is.
      colors: Object.fromEntries(
        colorNames.map((name) => [
          name,
          isHex(palette.light[name])
            ? `rgb(var(--color-${name}) / <alpha-value>)`
            : `var(--color-${name})`,
        ]),
      ),
      borderRadius: Object.fromEntries(Object.entries(radius).map(([k, v]) => [k, px(v)])),
      fontSize: Object.fromEntries(
        Object.entries(fontSize).map(([k, [size, lineHeight]]) => [
          k,
          [px(size), { lineHeight: px(lineHeight) }],
        ]),
      ),
      // Separate families per weight (custom fonts ignore fontWeight on Android).
      // Use `font-sans-bold`, `font-display-black` etc.; never combine with `font-bold`.
      fontFamily: {
        sans: [fontFamily.regular],
        'sans-medium': [fontFamily.medium],
        'sans-semibold': [fontFamily.semibold],
        'sans-bold': [fontFamily.bold],
        'sans-black': [fontFamily.black],
        display: [fontFamily.display],
        'display-bold': [fontFamily['display-bold']],
        'display-black': [fontFamily['display-black']],
      },
      // NativeWind sets 1rem = 14pt on native: the 56pt main controls are pinned in px.
      spacing: { 14: px(56) },
      minHeight: { touch: px(touchTarget) },
      minWidth: { touch: px(touchTarget) },
    },
  },
};

module.exports = preset;
module.exports.palette = palette;
module.exports.radius = radius;
module.exports.fontSize = fontSize;
module.exports.fontFamily = fontFamily;
module.exports.touchTarget = touchTarget;
module.exports.duration = duration;
module.exports.themeVars = themeVars;
