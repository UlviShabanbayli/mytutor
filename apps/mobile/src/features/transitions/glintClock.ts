import { cancelAnimation, makeMutable, withRepeat, withTiming } from 'react-native-reanimated';
import { easing } from '@/motion/tokens';

/** transitions.skeleton: one glint sweeps the screen every 1400ms. */
export const GLINT_MS = 1400;

/**
 * One clock for every skeleton block on screen, so their honey glints line up as a single sweep
 * in screen space. It runs only while at least one block is mounted.
 */
export const glintClock = makeMutable(0);
let users = 0;

export function startGlint(): () => void {
  users += 1;
  if (users === 1) {
    glintClock.set(0);
    glintClock.set(withRepeat(withTiming(1, { duration: GLINT_MS, easing: easing.exit }), -1));
  }
  return () => {
    users -= 1;
    if (users === 0) {
      cancelAnimation(glintClock);
      glintClock.set(0);
    }
  };
}
