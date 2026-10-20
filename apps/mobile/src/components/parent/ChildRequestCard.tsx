import { Pressable, View } from 'react-native';
import { Card, Icon, Text } from '@/components/ui';
import { HexAvatar } from './HexAvatar';

type ChildRequestCardProps = {
  name: string;
  subtitle?: string;
  status: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
};

/** A child who is not linked yet: an account under 13 waiting for the parent's consent. */
export function ChildRequestCard({
  name,
  subtitle,
  status,
  body,
  actionLabel,
  onAction,
}: ChildRequestCardProps) {
  return (
    <Card className="gap-2.5 p-3.5">
      <View className="flex-row items-center gap-3">
        <HexAvatar name={name} tone="wax" />
        <View className="min-w-0 flex-1 gap-0.5">
          <Text variant="subheading">{name}</Text>
          {subtitle ? (
            <Text variant="caption" tone="muted" className="font-sans">
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View className="h-[28px] flex-row items-center gap-1 rounded-full bg-raised px-2.5">
          <Icon name="clock" size={14} color="honey-text" />
          <Text className="font-sans-black text-xs text-honey-text">{status}</Text>
        </View>
      </View>
      <Text variant="caption" tone="muted" className="font-sans">
        {body}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${actionLabel}: ${name}`}
        onPress={onAction}
        className="min-h-[44px] items-center justify-center rounded-md border-2 border-honey active:bg-raised"
      >
        <Text className="font-sans-black text-sm text-honey-text">{actionLabel}</Text>
      </Pressable>
    </Card>
  );
}
