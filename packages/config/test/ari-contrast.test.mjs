// WCAG contrast checks for the arı mobile palette in both schemes.
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { palette } = require('../tailwind/ari.js');

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

/** [foreground, background]: every pair is text, so 4.5:1. */
const pairs = [
  ['ink', 'page'],
  ['ink', 'surf'],
  ['ink', 'raised'],
  ['ink', 'box'],
  ['muted', 'page'],
  ['muted', 'surf'],
  ['honey-text', 'surf'],
  ['honey-text', 'page'],
  ['honey-text', 'raised'],
  ['on-honey', 'honey'],
  ['on-nectar', 'nectar'],
  ['on-sealed', 'sealed'],
  ['lock-ink', 'wax'],
  ['lock-ink', 'surf'],
  ['info', 'info-bg'],
  ['ok', 'ok-bg'],
  ['ok', 'surf'],
  ['err', 'err-bg'],
  ['err', 'surf'],
  ['crystal-ink', 'crystal'],
  ['on-spot', 'spot'],
  ['honey', 'spot'],
  // Letters on solid correct/wrong boxes and the danger button label.
  ['page', 'ok'],
  ['page', 'err'],
];

describe.each(['light', 'dark'])('%s scheme', (scheme) => {
  it.each(pairs)('%s on %s ≥ 4.5:1', (fg, bg) => {
    expect(contrast(palette[scheme][fg], palette[scheme][bg])).toBeGreaterThanOrEqual(4.5);
  });
});
