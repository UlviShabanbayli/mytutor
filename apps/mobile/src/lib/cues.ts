import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '@/features/me/settingsStore';

/**
 * Feedback cues by name (design: "Səs və titrəmə · playCue(ad)"). For now each cue is a
 * haptic, chosen per moment in the motion lab (docs/design/motion.md); the design's sounds
 * join here later without touching callers. Nothing plays when the student turned "Titrəmə"
 * off in Mən → Ayarlar. A wrong answer gets only a light tap the student alone can feel.
 */
export type Cue =
  | 'tap'
  | 'select'
  | 'press'
  | 'open'
  | 'focus'
  | 'correct'
  | 'wrong'
  | 'warning'
  | 'complete'
  | 'streak'
  | 'levelUp'
  | 'reward';

export function playCue(cue: Cue): void {
  if (!useSettingsStore.getState().haptics) return;
  switch (cue) {
    case 'tap':
    case 'select':
      void Haptics.selectionAsync();
      return;
    case 'press':
    case 'open':
    case 'wrong':
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    case 'focus':
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return;
    case 'warning':
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    case 'correct':
    case 'complete':
    case 'streak':
    case 'levelUp':
    case 'reward':
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
  }
}
