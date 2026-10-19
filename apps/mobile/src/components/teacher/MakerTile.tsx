import { View } from 'react-native';
import { Icon, type IconName, PressableCard, Text } from '@/components/ui';

type MakerTileProps = { icon: IconName; title: string; body: string; onPress: () => void };

/** One of the four "Yarat" tiles: lesson, video, test, question. */
export function MakerTile({ icon, title, body, onPress }: MakerTileProps) {
  return (
    <PressableCard
      accessibilityLabel={`${title}. ${body}`}
      onPress={onPress}
      className="flex-1"
      contentClassName="min-h-[100px] flex-1 gap-1 px-3 pb-3 pt-2.5"
    >
      <View className="h-[38px] w-[38px] items-center justify-center rounded-md bg-raised">
        <Icon name={icon} size={24} color="honey-text" />
      </View>
      <Text className="font-sans-black text-base">{title}</Text>
      <Text className="font-sans text-xs text-muted">{body}</Text>
    </PressableCard>
  );
}
