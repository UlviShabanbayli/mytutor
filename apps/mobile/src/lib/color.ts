/** '#FFB800' + 0.45 → 'rgba(255,184,0,0.45)'; non-hex colours are returned as they are. */
export function withAlpha(color: string, alpha: number): string {
  const hex = color.replace('#', '');
  if (!color.startsWith('#') || hex.length !== 6) return color;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgba(${r},${g},${b},${alpha})`;
}
