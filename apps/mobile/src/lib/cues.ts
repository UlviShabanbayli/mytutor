import * as Haptics from 'expo-haptics';

/**
 * Feedback cues by name (design: "Səs və titrəmə · playCue(ad)"). For now each cue is a
 * haptic; the design's sounds join here later without touching callers. A wrong answer is
 * deliberately quiet: it must not embarrass anyone in a classroom.
 */
export type Cue = 'tap' | 'correct' | 'wrong' | 'complete' | 'streak' | 'levelUp' | 'reward';

export function playCue(cue: Cue): void {
  switch (cue) {
    case 'tap':
      void Haptics.selectionAsync();
      return;
    case 'correct':
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    case 'wrong':
      return;
    case 'complete':
    case 'streak':
    case 'levelUp':
    case 'reward':
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
  }
}
