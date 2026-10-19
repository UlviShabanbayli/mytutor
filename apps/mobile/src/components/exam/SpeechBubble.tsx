import { Pressable, View } from 'react-native';
import { Mascot } from '@/components/mascot/Mascot';
import type { MascotMoment } from '@/components/mascot/moments';
import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type SpeechBubbleProps = {
  moment: MascotMoment;
  size: number;
  text: string;
  /** `surf` bubbles sit on the page; `raised` ones are warmer (a tip). */
  tone?: 'surf' | 'raised';
  /** Makes the bubble a button (e.g. "Gəl başlayaq" opens the step). */
  onPress?: () => void;
  /** False when Vızı is drawn elsewhere on the screen (e.g. scouting above the bubble). */
  withMascot?: boolean;
};

/** Vızı speaking in first person: the mascot and a bubble pointing at it. */
export function SpeechBubble(props: SpeechBubbleProps) {
  const { moment, size, text, tone = 'surf', onPress, withMascot = true } = props;
  const bubble = (
    <View
      className={cn(
        'rounded-xl rounded-bl-[4px] px-3 py-2.5',
        tone === 'surf' ? 'border border-border bg-surf' : 'bg-raised',
      )}
    >
      <Text className="font-sans-semibold text-sm">{text}</Text>
    </View>
  );

  return (
    <View className="flex-row items-end gap-1.5">
      {withMascot ? <Mascot moment={moment} size={size} decorative /> : null}
      <View className="mb-2 min-w-0 flex-1">
        {onPress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={text}
            onPress={onPress}
            className="active:opacity-80"
          >
            {bubble}
          </Pressable>
        ) : (
          bubble
        )}
      </View>
    </View>
  );
}
