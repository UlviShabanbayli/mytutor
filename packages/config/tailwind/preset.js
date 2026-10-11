// Shared Tailwind preset (NativeWind v4 / Tailwind CSS v3).
// Semantic colors resolve to CSS variables so light/dark is switched once at the root
// (see apps/mobile/src/theme/ThemeProvider.tsx) instead of `dark:` on every element.
const { colors, radius, fontSize, fontFamily, touchTarget } = require('./tokens');

const colorNames = Object.keys(colors.light);

/** '#4F46E5' -> '79 70 229' (space-separated channels for `<alpha-value>` support). */
function hexToChannels(hex) {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

/** CSS variable map for one scheme: { '--color-primary': '79 70 229', ... }. */
function themeVars(scheme) {
  return Object.fromEntries(
    colorNames.map((name) => [`--color-${name}`, hexToChannels(colors[scheme][name])]),
  );
}

const px = (value) => `${value}px`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: Object.fromEntries(
        colorNames.map((name) => [name, `rgb(var(--color-${name}) / <alpha-value>)`]),
      ),
      borderRadius: Object.fromEntries(Object.entries(radius).map(([k, v]) => [k, px(v)])),
      fontSize: Object.fromEntries(
        Object.entries(fontSize).map(([k, [size, lineHeight]]) => [
          k,
          [px(size), { lineHeight: px(lineHeight) }],
        ]),
      ),
      // Separate families per weight (custom fonts ignore fontWeight on Android).
      // Use `font-sans-bold` etc.; never combine with `font-bold`/`font-semibold`.
      fontFamily: {
        sans: [fontFamily.regular],
        'sans-medium': [fontFamily.medium],
        'sans-bold': [fontFamily.bold],
        'sans-black': [fontFamily.black],
      },
      minHeight: { touch: px(touchTarget) },
      minWidth: { touch: px(touchTarget) },
    },
  },
};

module.exports.themeVars = themeVars;
