import { View } from 'react-native';
import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { ToggleSwitch } from './ToggleSwitch';

type SwitchRowProps = {
  title: string;
  sub?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  divider?: boolean;
};

/** A settings row that is one switch (sound, haptics, reduce motion). */
export function SwitchRow({ title, sub, value, onChange, divider }: SwitchRowProps) {
  return (
    <View
      className={cn('min-h-12 flex-row items-center gap-2.5', divider && 'border-t border-border')}
    >
      <View className="flex-1">
        <Text className="font-sans-bold">{title}</Text>
        {sub ? (
          <Text tone="muted" className="text-xs">
            {sub}
          </Text>
        ) : null}
      </View>
      <ToggleSwitch value={value} onChange={onChange} accessibilityLabel={title} />
    </View>
  );
}
