import { View } from 'react-native';
import { Icon, type IconName, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type IconNoteProps = {
  icon: IconName;
  text: string;
  className?: string;
};

/** A quiet muted line with an icon: safety tips and privacy reminders. */
export function IconNote({ icon, text, className }: IconNoteProps) {
  return (
    <View className={cn('flex-row items-start gap-2', className)}>
      <View className="pt-px">
        <Icon name={icon} size={16} color="muted" />
      </View>
      <Text variant="caption" tone="muted" className="min-w-0 flex-1">
        {text}
      </Text>
    </View>
  );
}
