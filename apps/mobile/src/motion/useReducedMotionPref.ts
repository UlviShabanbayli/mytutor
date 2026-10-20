import { useReducedMotion } from 'react-native-reanimated';
import { useSettingsStore } from '@/features/me/settingsStore';

/**
 * True when motion should be calm: the phone's "Reduce motion" setting or the app's own
 * "Hərəkəti azalt" (Mən → Ayarlar). Components then show the end state, or at most a short
 * fade (`duration.reduced`), instead of travelling, bouncing or looping.
 */
export function useReducedMotionPref(): boolean {
  const system = useReducedMotion();
  const app = useSettingsStore((s) => s.reduceMotion);
  return system || app;
}
