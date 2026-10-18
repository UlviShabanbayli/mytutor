import type { ReactNode } from 'react';
import { View } from 'react-native';
import { IconButton, Text } from '@/components/ui';

type CenterHeaderProps = {
  title: string;
  /** CAPS label style instead of a bold title (the topic page's "ÇƏRÇİVƏ 4 · …"). */
  overline?: boolean;
  backLabel: string;
  onBack: () => void;
  backIcon?: 'back' | 'close';
  /** Right side: one icon button; an empty 48pt slot keeps the title centered. */
  action?: ReactNode;
};

/** Pushed-screen header of the design: back on the left, a centered title, one action. */
export function CenterHeader({
  title,
  overline = false,
  backLabel,
  onBack,
  backIcon = 'back',
  action,
}: CenterHeaderProps) {
  return (
    <View className="flex-row items-center gap-1 px-2 pb-1">
      <IconButton icon={backIcon} accessibilityLabel={backLabel} onPress={onBack} />
      <View className="min-w-0 flex-1 items-center">
        {overline ? (
          <Text variant="overline" tone="muted" className="text-xs" numberOfLines={1}>
            {title}
          </Text>
        ) : (
          <Text accessibilityRole="header" numberOfLines={1} className="font-sans-black text-base">
            {title}
          </Text>
        )}
      </View>
      {action ?? <View className="min-w-touch" />}
    </View>
  );
}
