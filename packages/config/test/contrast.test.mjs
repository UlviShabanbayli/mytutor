// WCAG contrast checks for semantic color pairs in both schemes.
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { colors } = require('../tailwind/tokens.js');

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** [foreground, background, minimum ratio] */
const TEXT = 4.5;
const UI = 3;
const pairs = [
  ['foreground', 'background', TEXT],
  ['foreground', 'card', TEXT],
  ['muted-foreground', 'background', TEXT],
  ['muted-foreground', 'card', TEXT],
  ['muted-foreground', 'muted', TEXT],
  ['primary-foreground', 'primary', TEXT],
  ['primary-foreground', 'primary-pressed', TEXT],
  ['primary', 'card', TEXT],
  ['primary', 'background', TEXT],
  ['secondary-foreground', 'secondary', TEXT],
  ['accent-foreground', 'accent', TEXT],
  ['foreground', 'accent-muted', TEXT],
  ['success-foreground', 'success', TEXT],
  ['success', 'success-muted', TEXT],
  ['success', 'card', TEXT],
  ['destructive-foreground', 'destructive', TEXT],
  ['destructive', 'destructive-muted', TEXT],
  ['destructive', 'card', TEXT],
  ['input', 'card', UI],
];

describe.each(['light', 'dark'])('%s scheme', (scheme) => {
  it.each(pairs)('%s on %s ≥ %s:1', (fg, bg, min) => {
    expect(contrast(colors[scheme][fg], colors[scheme][bg])).toBeGreaterThanOrEqual(min);
  });
});
