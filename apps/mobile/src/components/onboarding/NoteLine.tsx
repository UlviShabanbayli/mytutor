import { View } from 'react-native';
import { Icon, type IconName, Text } from '@/components/ui';
import type { ColorName } from '@/theme';

type NoteLineProps = {
  icon: IconName;
  iconColor?: ColorName;
  text: string;
};

/** A quiet hint under the choices: an 18pt icon and one or two muted lines. */
export function NoteLine({ icon, iconColor = 'muted', text }: NoteLineProps) {
  return (
    <View className="flex-row items-start gap-2">
      <Icon name={icon} size={18} color={iconColor} />
      <Text variant="caption" tone="muted" className="flex-1 font-sans">
        {text}
      </Text>
    </View>
  );
}
