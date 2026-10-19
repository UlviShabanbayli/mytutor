import { View } from 'react-native';
import { Icon, Text } from '@/components/ui';

type CodeAlertProps = {
  title: string;
  body: string;
};

/** Why a code did not work, said calmly, with what to do next. */
export function CodeAlert({ title, body }: CodeAlertProps) {
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      className="flex-row items-start gap-2.5 rounded-md bg-err-bg px-3 py-2.5"
    >
      <Icon name="warning" size={20} color="err" />
      <View className="min-w-0 flex-1 gap-0.5">
        <Text className="font-sans-black">{title}</Text>
        <Text variant="caption" tone="muted" className="font-sans">
          {body}
        </Text>
      </View>
    </View>
  );
}
