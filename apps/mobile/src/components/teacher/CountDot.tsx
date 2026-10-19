import { View } from 'react-native';
import { Text } from '@/components/ui';

type CountDotProps = { count: number };

/** Unread count: a small red circle with the number (the label nearby says it in words). */
export function CountDot({ count }: CountDotProps) {
  if (count <= 0) return null;
  return (
    <View
      aria-hidden
      className="h-[20px] min-w-[20px] items-center justify-center rounded-full bg-err px-1.5"
    >
      <Text className="font-sans-black text-2xs text-surf">{count}</Text>
    </View>
  );
}
