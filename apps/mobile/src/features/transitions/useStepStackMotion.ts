import { useStackMotion } from './useStackMotion';

/**
 * Stack options of the step flows (first launch and account). transitions.onboarding A: the
 * frame (back button, step dashes, footer) stays put and only the question slides, which
 * `StepScreen` does itself; so the stack switches steps without its own animation, or with a
 * 150ms fade when the student asked for less motion.
 */
export function useStepStackMotion() {
  const stackMotion = useStackMotion();
  const reduced = stackMotion.animation === 'fade';
  return { ...stackMotion, animation: reduced ? ('fade' as const) : ('none' as const) };
}
