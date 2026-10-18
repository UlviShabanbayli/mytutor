import { View } from 'react-native';
import { Text } from '@/components/ui';

type GreetingBubbleProps = {
  greeting: string;
  /** The same greeting in the other language. */
  other: string;
  otherLanguage: string;
};

/** Vızı's first words, in both languages, in a speech bubble pointing at the mascot. */
export function GreetingBubble({ greeting, other, otherLanguage }: GreetingBubbleProps) {
  return (
    <View className="mb-[18px] flex-1 rounded-xl rounded-bl-[4px] border border-border bg-surf px-3 py-2.5">
      <Text className="font-sans-bold">{greeting}</Text>
      <Text tone="muted" className="font-sans-semibold" accessibilityLanguage={otherLanguage}>
        {other}
      </Text>
    </View>
  );
}
