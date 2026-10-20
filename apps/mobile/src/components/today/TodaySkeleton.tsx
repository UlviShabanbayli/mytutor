import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SkeletonBlock } from '@/components/ui';

/** Plan rows the skeleton holds space for (a usual day has two to four). */
const ROWS = [0, 1, 2];

/**
 * The day's shape in wax while it loads, each block as tall as what replaces it: the goal
 * card, "Davam et" and the plan (transitions.skeleton C).
 */
export function TodaySkeleton() {
  const { t } = useTranslation();

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={t('today.loading')}
      aria-busy
      className="gap-3"
    >
      <SkeletonBlock className="h-[173px] rounded-xl" />
      <SkeletonBlock className="h-[107px] rounded-xl" />
      <View className="gap-2">
        <View className="h-[26px] justify-center">
          <SkeletonBlock className="h-4 w-36 rounded-full" />
        </View>
        {ROWS.map((row) => (
          <SkeletonBlock key={row} className="h-[68px] rounded-lg" />
        ))}
      </View>
    </View>
  );
}
