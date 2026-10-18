import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';

/** Which page of the lesson text is open: a long honey dot among wax ones. */
export function PageDots({ index, total }: { index: number; total: number }) {
  const { t } = useTranslation();
  return (
    <View
      accessible
      accessibilityLabel={t('study.lesson.page', { n: index + 1, total })}
      className="flex-row gap-1.5 self-center"
    >
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          className={cn('h-2 rounded-full', i === index ? 'w-[22px] bg-honey' : 'w-2 bg-wax')}
        />
      ))}
    </View>
  );
}
