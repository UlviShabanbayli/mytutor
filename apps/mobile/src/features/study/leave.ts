import { router, type Href } from 'expo-router';

/** Back where the student came from, or to `fallback` when the screen was opened directly. */
export function leaveTo(fallback: Href) {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}
