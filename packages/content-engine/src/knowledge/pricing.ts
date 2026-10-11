/** USD per million tokens (Anthropic first-party API, as of 2026-10). Used for run reports only. */
const PRICES: Record<
  string,
  { input: number; output: number; cacheWrite: number; cacheRead: number }
> = {
  'claude-opus-5-5': { input: 4, output: 20, cacheWrite: 5, cacheRead: 0.2 },
  'claude-sonnet-5-5': { input: 2, output: 10, cacheWrite: 2.5, cacheRead: 0.2 },
  'claude-haiku-4-5': { input: 1, output: 5, cacheWrite: 1.25, cacheRead: 0.1 },
};

export type Usage = { input: number; output: number; cacheWrite: number; cacheRead: number };

export function costUsd(model: string, u: Usage): number {
  const key = Object.keys(PRICES).find((k) => model.startsWith(k));
  const p = PRICES[key ?? 'claude-opus-5-5'] ?? {
    input: 4,
    output: 20,
    cacheWrite: 5,
    cacheRead: 0.2,
  };
  const usd =
    (u.input * p.input +
      u.output * p.output +
      u.cacheWrite * p.cacheWrite +
      u.cacheRead * p.cacheRead) /
    1e6;
  return Math.round(usd * 10000) / 10000;
}
