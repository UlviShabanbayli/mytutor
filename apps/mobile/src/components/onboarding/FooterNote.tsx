import { View } from 'react-native';
import { Icon, type IconName, Text } from '@/components/ui';

type FooterNoteProps = {
  icon: IconName;
  text: string;
};

/** One centred muted line under the screen's actions ("Qonaq kimi başlayırsan…"). */
export function FooterNote({ icon, text }: FooterNoteProps) {
  return (
    <View className="flex-row items-center justify-center gap-1.5 px-2 pt-0.5">
      <Icon name={icon} size={16} color="muted" />
      <Text variant="caption" tone="muted" className="shrink text-center font-sans">
        {text}
      </Text>
    </View>
  );
}
