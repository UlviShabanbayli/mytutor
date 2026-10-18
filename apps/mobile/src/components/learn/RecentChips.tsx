import { Pressable, ScrollView, View } from 'react-native';
import { Icon, Text } from '@/components/ui';
import { useLearnText } from '@/features/learn/useLearnText';

type RecentChipsProps = {
  items: string[];
  onPick: (query: string) => void;
};

/** "SON": the last searches, one tap to search again. */
export function RecentChips({ items, onPick }: RecentChipsProps) {
  const { t } = useLearnText();
  if (items.length === 0) return null;

  return (
    <View className="flex-row items-center gap-2">
      <Text variant="overline" tone="muted" className="text-xs">
        {t('learn.search.recent')}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2"
      >
        {items.map((item) => (
          <Pressable
            key={item}
            accessibilityRole="button"
            accessibilityLabel={item}
            onPress={() => onPick(item)}
            className="h-[44px] flex-row items-center gap-1.5 rounded-md border border-border bg-surf px-3 active:opacity-80"
          >
            <Icon name="clock" size={14} color="muted" />
            <Text className="font-sans-semibold text-sm">{item}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
