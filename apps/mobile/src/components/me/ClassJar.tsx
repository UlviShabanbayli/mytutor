import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import type { ClassSummary } from '@/features/me/types';
import { Hex } from './Hex';

/** How many honey cells fit the drawn jar; the fill shows the share reached this week. */
const JAR_CELLS = 30;

type ClassJarProps = { jar: ClassSummary['jar'] };

/** "Sinif küpü": the class goal as a jar filling with honey cells from the bottom. */
export function ClassJar({ jar }: ClassJarProps) {
  const { t } = useTranslation();
  const exact = (jar.percent / 100) * JAR_CELLS;
  const full = Math.floor(exact);
  const cells = Array.from({ length: full + (exact > full ? 1 : 0) }, (_, i) => i < full);

  return (
    <View
      accessible
      accessibilityLabel={t('me.classPage.jarLabel', { percent: jar.percent })}
      className="flex-row items-center gap-3.5 rounded-xl border border-border bg-surf px-3.5 py-3"
    >
      <View className="items-center" importantForAccessibility="no-hide-descendants">
        <View className="h-2.5 w-[46px] rounded bg-slat-edge" />
        <View className="h-1.5 w-[34px] bg-slat-edge opacity-60" />
        <View className="h-[86px] w-[70px] flex-row flex-wrap-reverse content-start gap-px rounded-b-[22px] rounded-t-md border-[3px] border-slat-edge bg-box px-[5px] pb-[7px] pt-[5px]">
          {cells.map((isFull, i) => (
            <Hex key={i} width={10} fill={isFull ? 'honey' : 'nectar'} />
          ))}
        </View>
      </View>
      <View className="flex-1 gap-1">
        <Text variant="overline" tone="honey">
          {t('me.classPage.jarOverline')}
        </Text>
        <Text className="font-display-black text-lg">
          {t('me.classPage.jarPercent', { percent: jar.percent })}
        </Text>
        <Text tone="muted" className="text-sm">
          {t('me.classPage.jarGoal', { goal: jar.goal, done: jar.done })}
        </Text>
        <View className="self-start rounded-full bg-raised px-2 py-1">
          <Text className="font-sans-black text-xs text-honey-text">
            {t('me.classPage.jarMine', { count: jar.mine })}
          </Text>
        </View>
      </View>
    </View>
  );
}
