import type { LeagueRow } from './types';

export type LeagueZone = 'promotion' | 'stay' | 'demotion';

type ZoneRules = { size: number; promote: number; demote: number };

/** Whether a place moves up, stays or starts lower next week (design: 1–5 up, 16–20 down). */
export function leagueZone(place: number, { size, promote, demote }: ZoneRules): LeagueZone {
  if (place <= promote) return 'promotion';
  if (place > size - demote) return 'demotion';
  return 'stay';
}

export type LeagueSections = {
  promotion: LeagueRow[];
  /** The middle places shown at once: up to the row after the student. */
  middle: LeagueRow[];
  /** The middle places behind "göstər" (show). */
  hidden: LeagueRow[];
  demotion: LeagueRow[];
};

/** Splits a table into the design's sections, keeping the student's row always visible. */
export function leagueSections(rows: LeagueRow[], rules: ZoneRules, place: number): LeagueSections {
  const sorted = [...rows].sort((a, b) => a.place - b.place);
  const inZone = (zone: LeagueZone) => sorted.filter((r) => leagueZone(r.place, rules) === zone);
  const stay = inZone('stay');
  const lastShown = Math.max(place + 1, rules.promote + 2);
  return {
    promotion: inZone('promotion'),
    middle: stay.filter((r) => r.place <= lastShown),
    hidden: stay.filter((r) => r.place > lastShown),
    demotion: inZone('demotion'),
  };
}
