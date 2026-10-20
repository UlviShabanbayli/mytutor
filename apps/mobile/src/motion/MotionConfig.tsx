import { ReducedMotionConfig, ReduceMotion } from 'react-native-reanimated';
import { useSettingsStore } from '@/features/me/settingsStore';

/**
 * Applies "Hərəkəti azalt" to every Reanimated animation in the app: with it on, animations
 * jump to their end; otherwise they follow the phone's own setting.
 */
export function MotionConfig() {
  const reduce = useSettingsStore((s) => s.reduceMotion);
  return <ReducedMotionConfig mode={reduce ? ReduceMotion.Always : ReduceMotion.System} />;
}
