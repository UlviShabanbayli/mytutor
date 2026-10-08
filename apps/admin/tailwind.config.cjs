// Admin panel (web) uses the same tokens as the mobile app via the shared preset.
// Web differences: one variable Nunito font (weights via font-variation-settings instead of
// separate families) and theme variables emitted as CSS for light, dark and a manual override.
const preset = require('@mytutor/config/tailwind');

const { themeVars } = preset;
const nunito = ['"Nunito Variable"', 'system-ui', 'sans-serif'];
const weight = (w) => [nunito, { fontVariationSettings: `"wght" ${w}` }];

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  presets: [preset],
  theme: {
    extend: {
      fontFamily: {
        sans: weight(400),
        'sans-medium': weight(600),
        'sans-bold': weight(700),
        'sans-black': weight(900),
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [
    ({ addBase }) =>
      addBase({
        ':root': { ...themeVars('light'), colorScheme: 'light' },
        '@media (prefers-color-scheme: dark)': {
          ':root:not([data-theme="light"])': { ...themeVars('dark'), colorScheme: 'dark' },
        },
        ':root[data-theme="dark"]': { ...themeVars('dark'), colorScheme: 'dark' },
      }),
  ],
};
