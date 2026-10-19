import { View } from 'react-native';
import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type LinedPageProps = { lines: string[]; size?: 'thumb' | 'large'; minLines?: number };

/** A notebook page with the student's lines on ruled rows (a photo in the real app). */
export function LinedPage({ lines, size = 'thumb', minLines = 5 }: LinedPageProps) {
  const rows = [
    ...lines,
    ...Array.from({ length: Math.max(0, minLines - lines.length) }, () => ''),
  ];
  const large = size === 'large';

  return (
    <View className={cn('pt-1.5', large ? 'px-3' : 'px-2')}>
      {rows.map((line, i) => (
        <View
          key={i}
          className={cn('justify-end border-b border-border', large ? 'h-[40px]' : 'h-[26px]')}
        >
          <Text
            numberOfLines={1}
            className={cn('font-sans-semibold text-ink', large ? 'text-md' : 'text-xs')}
          >
            {line}
          </Text>
        </View>
      ))}
    </View>
  );
}
