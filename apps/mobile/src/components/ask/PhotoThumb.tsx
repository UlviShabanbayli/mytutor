import { Image, View } from 'react-native';
import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type PhotoThumbProps = {
  /** The student's photo; without one a paper sheet with a few characters of maths is drawn. */
  uri: string | null;
  /** Maths on the paper sheet, e.g. "(2x+3)³". */
  mark: string;
  size?: 'sm' | 'md';
  className?: string;
};

/** A question's photo as a small, slightly turned sheet of paper (same in both schemes). */
export function PhotoThumb({ uri, mark, size = 'sm', className }: PhotoThumbProps) {
  const md = size === 'md';

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={cn(
        '-rotate-3 overflow-hidden rounded-sm border border-border bg-cap',
        md ? 'h-16 w-14' : 'h-[54px] w-[46px]',
        className,
      )}
    >
      {uri ? (
        <Image source={{ uri }} resizeMode="cover" className="h-full w-full" />
      ) : (
        <View className={cn('gap-1', md ? 'px-[7px] py-2' : 'px-1.5 py-[7px]')}>
          <Text
            numberOfLines={1}
            className={cn('font-sans-black text-on-sealed', md ? 'text-2xs' : 'text-[9px]')}
          >
            {mark}
          </Text>
          <View className="h-0.5 w-[90%] rounded-full bg-on-sealed/35" />
          <View className="h-0.5 w-[70%] rounded-full bg-on-sealed/35" />
          <View className="h-0.5 w-[82%] rounded-full bg-on-sealed/35" />
        </View>
      )}
    </View>
  );
}
