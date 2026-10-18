import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { CellState } from '@/components/ui';
import { Text } from '@/components/ui';
import type { TextbookProgress } from '@/features/me/types';
import { cn } from '@/lib/cn';
import type { ColorName } from '@/theme';
import { Hex } from './Hex';

// Design order, from strongest to empty; colors of the five mastery levels.
const LEVELS: { state: CellState; bar: string; fill: ColorName; inner: ColorName }[] = [
  { state: 'reinforced', bar: 'bg-sealed', fill: 'sealed', inner: 'cap' },
  { state: 'mastered', bar: 'bg-honey', fill: 'honey', inner: 'honey' },
  { state: 'lesson_completed', bar: 'bg-nectar', fill: 'nectar', inner: 'nectar' },
  {
    state: 'needs_practice',
    bar: 'border border-crystal-ink bg-crystal',
    fill: 'crystal-ink',
    inner: 'crystal',
  },
  { state: 'not_started', bar: 'bg-wax', fill: 'wax', inner: 'wax' },
];

type MasteryCardProps = { textbook: TextbookProgress };

/** "Hüceyrələr": how many topics of a textbook sit at each mastery level, as a bar and a legend. */
export function MasteryCard({ textbook }: MasteryCardProps) {
  const { t } = useTranslation();
  const shown = LEVELS.filter((l) => textbook.levels[l.state] > 0);
  const aria = LEVELS.map((l) =>
    t('me.progress.levelAria', {
      name: t(`me.progress.levels.${l.state}.name`),
      count: textbook.levels[l.state],
    }),
  ).join(', ');

  return (
    <View
      accessibilityLabel={t('me.progress.levelsLabel')}
      className="gap-2.5 rounded-xl border border-border bg-surf px-3.5 py-3"
    >
      <View className="flex-row items-baseline justify-between gap-2">
        <Text accessibilityRole="header" className="font-sans-black text-base">
          {t('me.progress.cellsTitle')}
        </Text>
        <Text tone="muted" className="font-sans-bold text-sm">
          {t('me.progress.cellsMeta', {
            topics: t('common.topicsCount', { count: textbook.topics }),
            units: t('me.progress.unitsCount', { count: textbook.units }),
          })}
        </Text>
      </View>
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={aria}
        className="h-4 flex-row gap-[3px]"
      >
        {shown.map((l, i) => (
          <View
            key={l.state}
            className={cn(
              'min-w-1.5 rounded-[3px]',
              l.bar,
              i === 0 && 'rounded-l-lg',
              i === shown.length - 1 && 'rounded-r-lg',
            )}
            // Each segment is as wide as its share of the topics.
            style={{ flex: textbook.levels[l.state] }}
          />
        ))}
      </View>
      <View
        className="flex-row flex-wrap gap-y-1.5"
        importantForAccessibility="no-hide-descendants"
      >
        {LEVELS.map((l) => (
          <View key={l.state} className="w-1/2 flex-row items-center gap-2 pr-3">
            <Hex
              width={18}
              fill={l.fill}
              inner={{ fill: l.inner, inset: l.state === 'needs_practice' ? 2 : 5 }}
            />
            <View className="flex-1">
              <Text className="font-sans-black text-sm leading-4">
                {t(`me.progress.levels.${l.state}.name`)}
              </Text>
              <Text tone="muted" className="font-sans-semibold text-2xs">
                {t(`me.progress.levels.${l.state}.term`)}
              </Text>
            </View>
            <Text className="font-display-black text-sm">{textbook.levels[l.state]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
