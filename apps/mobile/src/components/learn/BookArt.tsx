import { View } from 'react-native';
import { Text } from '@/components/ui';
import type { Textbook } from '@/features/learn/types';

type BookArtProps = { book: Textbook };

/** A two-volume book as two stacked covers, a whole-year book as one cover with its initial. */
export function BookArt({ book }: BookArtProps) {
  if (book.parts > 1)
    return (
      <View className="h-[70px] w-[60px]">
        <View className="absolute left-4 top-0 h-[58px] w-[42px] items-end justify-end rounded-l rounded-r-lg bg-nectar pb-1 pr-1.5">
          <Text className="font-display-black text-xs text-on-nectar">2</Text>
        </View>
        <View className="absolute left-0 top-2.5 h-[58px] w-[42px] items-center justify-center rounded-l rounded-r-lg bg-honey">
          <Text className="font-display-black text-base text-on-honey">1</Text>
        </View>
      </View>
    );
  return (
    <View className="h-[70px] w-[60px] items-center justify-center">
      <View className="h-[64px] w-[48px] items-center justify-center rounded-l rounded-r-lg border-2 border-slat-edge bg-box">
        <Text className="font-display-black text-base" tone="honey">
          {book.name.slice(0, 1)}
        </Text>
      </View>
    </View>
  );
}
