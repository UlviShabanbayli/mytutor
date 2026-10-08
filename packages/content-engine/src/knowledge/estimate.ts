import type { ContentPart } from './claude';

/** Rough token estimate before calling the API (no network). Images: ≈ pixels / 750 after resizing. */
export function estimateTokens(parts: ContentPart[], system: string): number {
  const text = (s: string) => Math.ceil(s.length / 3.2);
  return (
    text(system) +
    parts.reduce((sum, p) => {
      if (p.type === 'text') return sum + text(p.text);
      const width = p.png.readUInt32BE(16);
      const height = p.png.readUInt32BE(20);
      const scale = Math.min(
        1,
        1568 / Math.max(width, height),
        Math.sqrt(1_150_000 / (width * height)),
      );
      return sum + Math.ceil((width * scale * height * scale) / 750);
    }, 0)
  );
}
