import { useState } from 'react';
import { useIsFocused } from 'expo-router';

export type Rise = { from: number; to: number; key: number };

/**
 * A number that went up since the student last saw this screen, e.g. the flight days after the
 * day's first test (feedback.streak) or today's minutes (feedback.goal). It is reported once, when
 * the screen is in front again, so the moment plays where the student can see it; the value the
 * screen opened with never counts as a rise.
 */
export function useRiseSinceSeen(value: number): Rise | null {
  const focused = useIsFocused();
  const [seen, setSeen] = useState(value);
  const [rise, setRise] = useState<Rise | null>(null);
  const [wasFocused, setWasFocused] = useState(focused);

  // Derived during render (React's "adjust state when a prop changes"), so the moment starts in
  // the same frame the screen comes back.
  if (focused !== wasFocused) {
    setWasFocused(focused);
    if (!focused) setRise(null);
  }
  if (focused && value !== seen) {
    setSeen(value);
    if (value > seen) setRise({ from: seen, to: value, key: (rise?.key ?? 0) + 1 });
  }

  return rise;
}
