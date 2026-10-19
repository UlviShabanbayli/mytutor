/** One character of a rolling number: digits roll on their own strip, the rest stays still. */
export type RollingSlot = {
  /** Stable from the right, so the ones keep their strip when 99 becomes 100. */
  key: string;
  char: string;
  digit: number | null;
  /** Position among the digits from the left: the stagger order (micro.count). */
  order: number;
};

const NBSP = ' ';

/** 2140 → "2 140" with a no-break space, as Azerbaijani and Russian write thousands. */
export function groupThousands(value: number): string {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
}

/** Splits shown text ("2 140", "+15", "80%") into rolling digits and still characters. */
export function rollingSlots(text: string): RollingSlot[] {
  const chars = Array.from(text);
  let order = 0;
  return chars.map((char, i) => {
    const isDigit = char >= '0' && char <= '9';
    const slot: RollingSlot = {
      key: `${isDigit ? 'd' : 'c'}${chars.length - 1 - i}`,
      char,
      digit: isDigit ? Number(char) : null,
      order: isDigit ? order : -1,
    };
    if (isDigit) order += 1;
    return slot;
  });
}

/** How long a roll lasts, so the "settled" cue can follow the last digit (micro.count). */
export function rollDuration(digits: number, stagger: number, settle: number): number {
  return Math.max(0, digits - 1) * stagger + settle;
}
