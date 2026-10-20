import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { Mascot } from '@/components/mascot/Mascot';

type FirstDayGreetingProps = {
  name: string | null;
  minutes: number;
};

/**
 * Vızı says hello on the first day, with a speech bubble: it peeks out of the hive (vizi.greet
 * C), then idles; taps tickle it (vizi.tap B) and its giggles show in the same bubble.
 */
export function FirstDayGreeting({ name, minutes }: FirstDayGreetingProps) {
  const { t } = useTranslation();
  const [line, setLine] = useState<string | null>(null);
  const greeting = name
    ? t('today.firstDay.greetingNamed', { name, minutes })
    : t('today.firstDay.greeting', { minutes });
  const text = line ?? greeting;

  return (
    <View className="flex-row items-end gap-1.5">
      <Mascot moment="greeting" behavior="greet" tappable onSay={setLine} size={80} decorative />
      <View className="mb-3.5 min-w-0 flex-1 rounded-xl rounded-bl-[4px] border border-border bg-surf px-3 py-2.5">
        <Text
          accessibilityRole="text"
          accessibilityLiveRegion="polite"
          className="font-sans-semibold"
        >
          {text}
        </Text>
      </View>
    </View>
  );
}
