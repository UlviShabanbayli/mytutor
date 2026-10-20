import { View } from 'react-native';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';
import { useLive, useScoped } from './live/useLive';
import { ALL_SAID, useNarration, type NarratorWord } from './live/useNarration';
import { startLife } from './rig/moves/life';
import { setFace } from './rig/moves/pose';
import { ViziRig } from './rig/ViziRig';
import { AudioBars } from './scenes/AudioBars';
import { CaptionWord } from './scenes/CaptionWord';

export type { NarratorWord } from './live/useNarration';

type ViziNarratorProps = {
  /** The sentence as spoken words with their times (seconds). */
  words: NarratorWord[];
  /** Playback position (seconds) of the lesson audio; omit to loop on its own clock (demo). */
  position?: SharedValue<number>;
  size?: number;
};

/**
 * vizi.explain C «Səsləndirir», for the video lessons: the caption lights up word by word while
 * Vızı's mouth runs visemes and five voice bars move; after the sentence a closed smile. Driven
 * by word timestamps (Azure az-AZ TTS reports word boundaries). Reduced motion: the whole caption,
 * a closed smile, still bars. Screen readers get the sentence once, as text.
 */
export function ViziNarrator({ words, position, size = 120 }: ViziNarratorProps) {
  const { rig, reduced, active } = useLive('rest', 'rest', (r) => setFace(r, 'izah'));
  const { current, meter } = useNarration(rig, words, active, position);
  const shown = useDerivedValue(() => (reduced ? ALL_SAID : current.value));
  const sentence = words.map((w) => w.text).join(' ');

  useScoped(true, () => {
    if (reduced) setFace(rig, 'happy');
  });
  useScoped(active, (S) => startLife(S, rig, { hover: 3 }));

  return (
    <View className="flex-row items-center gap-3">
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        className="items-center gap-2"
      >
        <ViziRig rig={rig} size={size} />
        <AudioBars tick={meter} />
      </View>
      <View
        accessible
        accessibilityRole="text"
        accessibilityLabel={sentence}
        className="min-w-0 flex-1 flex-row flex-wrap gap-y-0.5"
      >
        {words.map((w, i) => (
          <CaptionWord key={`${i}${w.text}`} text={w.text} index={i} current={shown} />
        ))}
      </View>
    </View>
  );
}
