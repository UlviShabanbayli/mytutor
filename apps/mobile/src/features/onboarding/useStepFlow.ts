import { type Href, router, useLocalSearchParams } from 'expo-router';

/**
 * Moves through the first-launch steps. A step opened from the summary ("Hazırdır!" → edit)
 * carries `from=ready` and returns there instead of walking the rest of the steps again.
 */
export function useStepFlow() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const fromReady = from === 'ready';

  return {
    fromReady,
    /** Opens the next step, or goes back to the summary when editing from it. */
    next: (href: Href) => {
      if (fromReady) router.dismissTo('/onboarding/ready');
      else router.push(href);
    },
    /** Opens a branch step (the exam) that must still be answered before the summary. */
    branch: (pathname: '/onboarding/exam') =>
      router.push(fromReady ? { pathname, params: { from: 'ready' } } : pathname),
  };
}
