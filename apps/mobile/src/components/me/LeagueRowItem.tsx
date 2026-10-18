import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { formatNumber } from '@/features/me/format';
import type { LeagueRow } from '@/features/me/types';
import { cn } from '@/lib/cn';
import type { ColorName } from '@/theme';
import { Hex } from './Hex';

// Avatar tiles cycle through four calm pairs; the student's own tile is honey.
const AVATARS: readonly [ColorName, string][] = [
  ['raised', 'text-honey-text'],
  ['crystal', 'text-crystal-ink'],
  ['ok-bg', 'text-ok'],
  ['info-bg', 'text-info'],
];

type LeagueRowItemProps = { row: LeagueRow; promoted?: boolean };

/** One place of a leaderboard: number, nickname tile, nickname, "Sən", points. */
export function LeagueRowItem({ row, promoted = false }: LeagueRowItemProps) {
  const { t } = useTranslation();
  const [fill, ink]: [ColorName, string] = row.me
    ? ['honey', 'text-on-honey']
    : (AVATARS[row.place % AVATARS.length] ?? ['raised', 'text-honey-text']);
  const points = formatNumber(row.points);
  const place = t('me.shared.place', { count: row.place, ordinal: true });

  return (
    <View
      accessible
      accessibilityLabel={t(row.me ? 'me.league.rowLabelMe' : 'me.league.rowLabel', {
        place,
        nickname: row.nickname,
        points,
      })}
      className={cn(
        'min-h-11 flex-row items-center gap-2.5 rounded-[12px] px-2',
        row.me ? 'border-2 border-honey bg-raised' : promoted && 'bg-ok-bg',
      )}
    >
      <Text className="w-[22px] text-center font-sans-black text-sm text-muted">{row.place}</Text>
      <Hex width={30} fill={fill}>
        <Text className={cn('font-sans-black text-sm', ink)}>{row.nickname.charAt(0)}</Text>
      </Hex>
      <Text className="flex-1 font-sans-bold text-base" numberOfLines={1}>
        {row.nickname}
      </Text>
      {row.me ? (
        <View className="h-5 justify-center rounded-full bg-honey px-[7px]">
          <Text className="font-sans-black text-2xs text-on-honey">{t('me.shared.you')}</Text>
        </View>
      ) : null}
      <Text className="font-sans-black text-sm">{t('me.shared.points', { value: points })}</Text>
    </View>
  );
}
