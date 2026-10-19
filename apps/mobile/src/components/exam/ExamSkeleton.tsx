import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SkeletonBlock } from '@/components/ui';

/**
 * The exam plan's shape in wax while it loads, each block as tall as what replaces it: days
 * left, readiness, today's steps, weak spots and the next mock (transitions.skeleton C).
 */
export function ExamSkeleton() {
  const { t } = useTranslation();

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={t('common.loading')}
      aria-busy
      className="gap-2.5"
    >
      <SkeletonBlock className="h-[126px] rounded-xl" />
      <SkeletonBlock className="h-[121px] rounded-xl" />
      <SkeletonBlock className="h-[245px] rounded-xl" />
      <SkeletonBlock className="h-[178px] rounded-xl" />
      <SkeletonBlock className="h-[98px] rounded-xl" />
    </View>
  );
}
