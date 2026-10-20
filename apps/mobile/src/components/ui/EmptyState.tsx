import { View } from 'react-native';
import { Mascot } from '../mascot/Mascot';
import type { MascotMoment } from '../mascot/moments';
import { Button } from './Button';
import { Text } from './Text';

type EmptyStateProps = {
  /** Which mascot moment to show above the text; empty states default to "thinking". */
  moment?: MascotMoment;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

/** Centered mascot, title, one line of help and an optional action. */
export function EmptyState({
  moment = 'aiThinking',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-6 py-12">
      <Mascot moment={moment} behavior="idle" enter size={140} />
      <Text variant="heading" className="text-center">
        {title}
      </Text>
      {description ? (
        <Text tone="muted" className="max-w-sm text-center">
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} className="mt-2 self-stretch" />
      ) : null}
    </View>
  );
}
