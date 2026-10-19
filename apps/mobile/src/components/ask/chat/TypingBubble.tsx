import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';

/** "Vızı düşünür… dərslikdə axtarır" with three honey dots while the reply is prepared. */
export function TypingBubble() {
  const { t } = useTranslation();

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={t('ask.chat.thinkingA11y')}
      accessibilityLiveRegion="polite"
      className="flex-row items-center gap-2.5 self-start rounded-xl rounded-bl-[4px] border border-border bg-surf px-3.5 py-3"
    >
      <View className="flex-row gap-[5px]">
        <View className="h-2 w-2 rounded-full bg-honey" />
        <View className="h-2 w-2 rounded-full bg-honey opacity-60" />
        <View className="h-2 w-2 rounded-full bg-honey opacity-30" />
      </View>
      <Text variant="caption" tone="muted" className="text-sm">
        {t('ask.chat.thinking')}
      </Text>
    </View>
  );
}
