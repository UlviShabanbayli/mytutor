import { Platform } from 'react-native';

/** Longer than any gap between letting go and the browser's click. */
const WINDOW_MS = 300;

/**
 * On the web a press fires on the browser's `click`, which also follows a mouse drag that
 * ends over the same row. After a pull, the next click is dropped so the row stays shut.
 * Phones need nothing: the gesture cancels the row's touch as soon as it starts.
 */
export function swallowNextClick(): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  const stop = (e: Event) => {
    e.stopPropagation();
    e.preventDefault();
  };
  document.addEventListener('click', stop, { capture: true, once: true });
  setTimeout(() => document.removeEventListener('click', stop, { capture: true }), WINDOW_MS);
}
