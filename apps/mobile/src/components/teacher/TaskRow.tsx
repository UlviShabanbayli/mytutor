import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Icon, type IconName, PressableCard, Text } from '@/components/ui';

type TaskRowProps = {
  icon: IconName;
  title: string;
  meta: string;
  onPress: () => void;
  /** Right side; a chevron by default. */
  trailing?: ReactNode;
  accessibilityLabel?: string;
};

/** A 64pt tappable row with a raised icon box ("Bu gün", drafts, materials). */
export function TaskRow({
  icon,
  title,
  meta,
  onPress,
  trailing,
  accessibilityLabel,
}: TaskRowProps) {
  return (
    <PressableCard
      accessibilityLabel={accessibilityLabel ?? `${title}. ${meta}`}
      onPress={onPress}
      contentClassName="min-h-[64px] flex-row items-center gap-3 rounded-lg px-3 py-2"
      className="rounded-lg"
    >
      <View className="h-[40px] w-[40px] items-center justify-center rounded-md bg-raised">
        <Icon name={icon} size={20} color="honey-text" />
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <Text className="font-sans-black">{title}</Text>
        <Text variant="caption" tone="muted" className="font-sans">
          {meta}
        </Text>
      </View>
      {trailing ?? <Icon name="chevron" size={18} color="muted" />}
    </PressableCard>
  );
}
