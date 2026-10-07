import { View } from 'react-native';
import { Button, Card, Icon, Text, type IconName } from '@/components/ui';

type QuickActionCardProps = {
  icon: IconName;
  title: string;
  description: string;
  actionLabel: string;
  onPress: () => void;
};

export function QuickActionCard({
  icon,
  title,
  description,
  actionLabel,
  onPress,
}: QuickActionCardProps) {
  return (
    <Card className="gap-4">
      <View className="flex-row items-start gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-md bg-secondary">
          <Icon name={icon} color="secondary-foreground" />
        </View>
        <View className="flex-1 gap-1">
          <Text variant="heading">{title}</Text>
          <Text tone="muted">{description}</Text>
        </View>
      </View>
      <Button label={actionLabel} onPress={onPress} fullWidth />
    </Card>
  );
}
