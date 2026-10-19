import { useEffect, useState } from 'react';

/** 42 -> "0:42", 75 -> "1:15". */
export function formatCountdown(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Whole seconds from `now` until `until` (a timestamp), never below zero. */
export function secondsUntil(until: number | null, now: number): number {
  if (until === null) return 0;
  return Math.max(0, Math.ceil((until - now) / 1000));
}

/** Seconds left until a timestamp, ticking once a second; 0 when there is nothing to wait for. */
export function useSecondsLeft(until: number | null): number {
  const [left, setLeft] = useState(() => secondsUntil(until, Date.now()));

  useEffect(() => {
    const tick = () => setLeft(secondsUntil(until, Date.now()));
    // The first tick runs at once so a new `until` shows without waiting a second.
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [until]);

  return left;
}
