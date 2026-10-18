import { useCallback, useEffect, useState } from 'react';

/** Seconds left until an action may run again (SMS "Yenidən · 0:42"); `restart` starts over. */
export function useCountdown(seconds: number) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    if (left <= 0) return;
    const timer = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [left]);

  const restart = useCallback(() => setLeft(seconds), [seconds]);
  return { left, restart };
}
