/*
 * Choreography of the hive moments that span a whole screen (docs/design/motion.md). Times
 * are ms after the screen opens; cell-level changes live with HexCell (ui/hex/cellMotion).
 */

/** hive.frame-toggle A · Sıra ilə. */
export const frameToggle = {
  open: 320,
  close: 260,
  /** Cells fade before the frame closes; the height follows a little later. */
  cellsOut: 120,
  closeDelay: 60,
  chevron: 220,
  cellIn: 240,
  cellFirst: 80,
  cellStep: 45,
  /** The closed frame's strip of mini cells comes back. */
  stripIn: 200,
  stripDelay: 160,
} as const;

/** hive.cell-tap B · Yaylı: the sheet's blocks come in one after another. */
export const sheetRows = { first: 140, step: 45, duration: 240, rise: 10 } as const;

/** hive.current-pulse A · Nəfəs: the ring breathes 3 times (6 halves) and stops. */
export const currentPulse = { delay: 600, half: 1200, halves: 6 } as const;

/** hive.placement-result C · Vızı ilə. */
export const placementResult = {
  start: 400,
  /** Delay per step along the diagonal (row + column). */
  step: 70,
  fill: 300,
  /** The start cell fills with nectar a little after its neighbours. */
  startExtra: 300,
  /** The counters tick when a cell is half-way in. */
  land: 110,
  after: 300,
  /** Vızı's own pop (vizi.correct C) starts this far into her moment, so she starts early. */
  viziLead: 200,
  card: 300,
  pulse: 1200,
} as const;

/** hive.unit-sealed B · Bayram, on the honey "Çərçivə möhürləndi" page. */
export const unitSealed = {
  vizi: [200, 700],
  cells: 760,
  cellStep: 110,
  bounce: 420,
  /** The queen's cap is traced from here, so it fills as the queen wakes. */
  queenSeal: 150,
  queen: [1450, 600],
  glow: [1550, 900],
  gain: [1250, 1000],
  cta: [1950, 320],
} as const;

type WaveUnit = { id: string; topics: readonly { id: string }[] };

export type PlacementWave = {
  /** When each filled mini cell starts to fade in, by topic id. */
  cellAt: Record<string, number>;
  /** When each unit's known cells land (its counter ticks), by unit id. */
  landAt: Record<string, number[]>;
  /** When the wave is over: Vızı, the start card and its pulse follow. */
  end: number;
};

/**
 * The diagonal wave of the check's result: a known cell in unit `row`, position `column`
 * fills at start + (row + column)·step; the start cell gets nectar a little later.
 */
export function placementWave(
  units: readonly WaveUnit[],
  knownIds: readonly string[],
  startId: string | null,
): PlacementWave {
  const p = placementResult;
  const cellAt: Record<string, number> = {};
  const landAt: Record<string, number[]> = {};
  let last: number = p.start;
  units.forEach((unit, row) => {
    landAt[unit.id] = [];
    unit.topics.forEach((topic, column) => {
      const known = knownIds.includes(topic.id);
      if (!known && topic.id !== startId) return;
      const at = p.start + (row + column) * p.step + (known ? 0 : p.startExtra);
      cellAt[topic.id] = at;
      if (known) landAt[unit.id]?.push(at + p.land);
      last = Math.max(last, at);
    });
  });
  return { cellAt, landAt, end: last + p.after };
}
