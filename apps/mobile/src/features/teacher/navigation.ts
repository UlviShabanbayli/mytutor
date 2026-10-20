import { type Href, router } from 'expo-router';

/** Back where the teacher came from; a screen opened from a link goes to `fallback` instead. */
export function goBack(fallback: Href) {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}
