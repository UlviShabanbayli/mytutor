import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import { formatNumber } from '@/features/me/format';
import type { RankProgress } from '@/features/me/rank';
import { RANK_IDS } from '@/features/me/types';
import { Hex } from './Hex';

type RankCardProps = { points: number; progress: RankProgress };

/** The inverted rank card: current rank, the next one and the points still to collect. */
export function RankCard({ points, progress }: RankCardProps) {
  const { t } = useTranslation();
  const rank = t(`me.ranks.${RANK_IDS[progress.index] ?? 'larva'}`);
  const nextId = RANK_IDS[progress.index + 1];
  const target = progress.target;
  const label =
    target === null
      ? t('me.home.rankLabelTop', { rank, points: formatNumber(points) })
      : t('me.home.rankLabel', {
          rank,
          points: formatNumber(points),
          target: formatNumber(target),
        });

  return (
    <View accessible accessibilityLabel={label} className="gap-2 rounded-xl bg-spot px-3.5 py-3">
      <View className="flex-row items-center gap-3">
        <Hex width={44} fill="honey">
          <Icon name="wing" size={22} color="on-honey" />
        </Hex>
        <View className="flex-1 gap-0.5">
          <Text variant="overline" className="text-honey">
            {t('me.home.rankStep', { n: progress.index + 1, total: RANK_IDS.length })}
          </Text>
          <Text className="font-display-bold text-lg text-on-spot">{rank}</Text>
        </View>
        {nextId ? (
          <View className="items-end gap-0.5">
            <Text className="text-xs text-on-spot opacity-80">{t('me.home.rankNext')}</Text>
            <Text className="font-sans-black text-base text-on-spot">
              {t(`me.ranks.${nextId}`)}
            </Text>
          </View>
        ) : null}
      </View>
      <View className="h-2.5 flex-row overflow-hidden rounded-[5px] bg-spot-line">
        {/* Width is the data-driven share of the next rank's points. */}
        <View
          className="rounded-[5px] bg-honey"
          style={{ width: `${Math.round(progress.ratio * 100)}%` }}
        />
      </View>
      <View className="flex-row justify-between gap-2">
        <Text className="font-sans-black text-sm text-on-spot">
          {target === null
            ? t('me.shared.points', { value: formatNumber(points) })
            : t('me.home.rankPoints', {
                points: formatNumber(points),
                target: formatNumber(target),
              })}
        </Text>
        <Text className="text-sm text-on-spot opacity-80">
          {target === null
            ? t('me.home.rankTop')
            : t('me.home.rankLeft', { points: formatNumber(progress.remaining) })}
        </Text>
      </View>
    </View>
  );
}
