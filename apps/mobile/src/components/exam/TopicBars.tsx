import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import type { GroupScore, ScoreLevel } from '@/features/exam/mockScoring';
import { cn } from '@/lib/cn';

type TopicBarsProps = {
  groups: GroupScore[];
};

const fill: Record<ScoreLevel, string> = {
  good: 'bg-honey',
  mid: 'bg-nectar',
  weak: 'bg-crystal-ink',
};
const word: Record<ScoreLevel, string> = {
  good: 'text-honey-text',
  mid: 'text-muted',
  weak: 'text-crystal-ink',
};

/** Result per unit: right of asked, a bar, and the level in words (never colour alone). */
export function TopicBars({ groups }: TopicBarsProps) {
  const { t } = useTranslation();

  return (
    <View
      accessibilityLabel={t('exam.result.topicsA11y')}
      className="gap-2 rounded-xl border border-border bg-surf px-3.5 py-3"
    >
      <Text className="font-sans-black text-base">{t('exam.result.topicsTitle')}</Text>
      {groups.map((g) => {
        const level = t(`exam.result.level.${g.level}`);
        return (
          <View
            key={g.group.id}
            accessible
            accessibilityLabel={t('exam.result.barA11y', {
              title: g.group.title,
              total: g.total,
              correct: g.correct,
              level,
            })}
            className="gap-1"
          >
            <View className="flex-row items-baseline gap-2">
              <Text className="min-w-0 flex-1 font-sans-semibold text-sm">{g.group.title}</Text>
              <Text className="font-sans-black text-sm">{`${g.correct}/${g.total}`}</Text>
              <Text className={cn('w-14 text-right font-sans-black text-xs', word[g.level])}>
                {level}
              </Text>
            </View>
            <View className="h-2 overflow-hidden rounded-full bg-wax">
              {/* Width is the unit's score, so it cannot be a static className. */}
              <View
                className={cn('h-full rounded-full', fill[g.level])}
                style={{ width: `${g.percent}%` }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}
