import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import { leagueSections } from '@/features/me/league';
import { LEAGUE_IDS, type LeagueTable } from '@/features/me/types';
import { LeagueRowItem } from './LeagueRowItem';

type LeagueStandingsProps = { table: LeagueTable; scope: 'country' | 'class' };

/**
 * The table: the promotion zone, the student and the place after, the rest behind "göstər",
 * then the zone that starts one league lower. A class table is a plain list.
 */
export function LeagueStandings({ table, scope }: LeagueStandingsProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const leagueName = t(`me.leagues.${table.league}`);
  const down = LEAGUE_IDS[LEAGUE_IDS.indexOf(table.league) - 1];
  const s = leagueSections(
    table.rows,
    { size: table.rows.length, promote: table.promote, demote: table.demote },
    // Not in the table (no points yet): every middle place is behind "göstər".
    table.place ?? 0,
  );
  const first = s.hidden[0];
  const last = s.hidden[s.hidden.length - 1];

  if (scope === 'class') {
    return (
      <View
        accessibilityLabel={t('me.league.classTableLabel')}
        className="gap-0.5 rounded-[18px] border border-border bg-surf px-2 py-1.5"
      >
        {table.rows.map((r) => (
          <LeagueRowItem key={r.place} row={r} />
        ))}
      </View>
    );
  }

  return (
    <View
      accessibilityLabel={t('me.league.tableLabel', { league: leagueName })}
      className="gap-0.5 rounded-[18px] border border-border bg-surf px-2 py-1.5"
    >
      <View className="flex-row items-center gap-1.5 px-1.5 py-1">
        <View className="-rotate-90">
          <Icon name="chevron" size={14} color="ok" />
        </View>
        <Text variant="overline" className="text-ok">
          {t('me.league.promotionZone')}
        </Text>
      </View>
      {s.promotion.map((r) => (
        <LeagueRowItem key={r.place} row={r} promoted />
      ))}
      <View className="mx-1.5 my-1 h-px bg-border" />
      {s.middle.map((r) => (
        <LeagueRowItem key={r.place} row={r} />
      ))}
      {expanded ? s.hidden.map((r) => <LeagueRowItem key={r.place} row={r} />) : null}
      {first && last ? (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          onPress={() => setExpanded((e) => !e)}
          className="min-h-touch items-center justify-center"
        >
          <Text className="font-sans-bold text-sm text-muted">
            {expanded
              ? t('me.league.showLess')
              : t('me.league.showMore', { from: first.place, count: last.place, ordinal: true })}
          </Text>
        </Pressable>
      ) : null}
      {down ? (
        <View className="flex-row items-center gap-1.5 px-1.5 py-1">
          <Icon name="down" size={14} color="crystal-ink" />
          <Text variant="overline" className="text-crystal-ink">
            {t('me.league.demotionZone', { league: t(`me.leaguesCaps.${down}`) })}
          </Text>
        </View>
      ) : null}
      {s.demotion.map((r) => (
        <LeagueRowItem key={r.place} row={r} />
      ))}
    </View>
  );
}
