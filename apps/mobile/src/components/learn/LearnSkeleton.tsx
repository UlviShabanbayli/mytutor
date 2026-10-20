import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SkeletonBlock } from '@/components/ui';

/**
 * The learn tab's shape in wax while a grade loads, as tall as what replaces it: the hive
 * card, the other subjects and the note under them (transitions.skeleton C).
 */
export function LearnSkeleton() {
  const { t } = useTranslation();

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={t('common.loading')}
      aria-busy
      className="gap-3"
    >
      <SkeletonBlock className="h-[198px] rounded-xl" />
      <SkeletonBlock className="h-[292px] rounded-xl" />
      <SkeletonBlock className="h-9 rounded-md" />
    </View>
  );
}
