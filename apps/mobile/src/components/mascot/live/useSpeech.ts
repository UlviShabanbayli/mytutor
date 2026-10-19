import { useState } from 'react';

/** Below this size a mascot has no room for its own bubble. */
const BUBBLE_MIN = 96;

/**
 * Where Vızı's lines go: to the screen's `onSay` when it has one, else to the mascot's own
 * bubble when the mascot is big enough. Returns the bubble text and the `speak` function.
 */
export function useSpeech(size: number, onSay?: (text: string | null) => void) {
  const [bubble, setBubble] = useState<string | null>(null);
  const speak = (text: string | null) => {
    if (onSay) onSay(text);
    else if (size >= BUBBLE_MIN) setBubble(text);
  };
  return { bubble: onSay ? null : bubble, speak };
}
