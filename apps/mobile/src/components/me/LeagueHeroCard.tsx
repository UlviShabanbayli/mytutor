import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import { LEAGUE_IDS, type LeagueTable } from '@/features/me/types';
import { Hex } from './Hex';

type LeagueHeroCardProps = { table: LeagueTable };

/** This week's league, the student's place, when the week ends and who moves up or down. */
export function LeagueHeroCard({ table }: LeagueHeroCardProps) {
  const { t } = useTranslation();
  const index = LEAGUE_IDS.indexOf(table.league);
  const name = t(`me.leagues.${table.league}`);
  const up = LEAGUE_IDS[index + 1];
  const down = LEAGUE_IDS[index - 1];
  const size = table.rows.length;
  const leagueName = t('me.league.leagueName', { name });
  const place =
    table.place === null
      ? t('me.league.noPlace')
      : t('me.shared.place', { count: table.place, ordinal: true });

  return (
    <View
      accessible
      accessibilityLabel={`${t('me.league.heroLabel', {
        league: leagueName,
        place,
      })}. ${t('me.league.endsIn', { count: table.daysLeft })}`}
      className="gap-2.5 rounded-xl bg-spot p-3.5"
    >
      <View className="flex-row items-center gap-3">
        <Hex width={48} fill="honey">
          <Icon name="trophy" size={24} color="on-honey" />
        </Hex>
        <View className="flex-1 gap-0.5">
          <Text variant="overline" className="text-honey">
            {t('me.league.weekLeague', { count: index + 1, ordinal: true })}
          </Text>
          <Text className="font-display-bold text-lg text-on-spot">{leagueName}</Text>
        </View>
        {table.place === null ? (
          <Text className="max-w-[40%] text-right text-xs text-on-spot opacity-80">{place}</Text>
        ) : (
          <View className="items-end">
            <Text className="font-display-black text-xl text-on-spot">{table.place}</Text>
            <Text className="text-xs text-on-spot opacity-80">
              {t('me.league.placeSuffix', { count: table.place, ordinal: true })}
            </Text>
          </View>
        )}
      </View>
      <View className="flex-row items-center gap-1.5">
        <Icon name="clock" size={16} color="on-spot" />
        <Text className="text-sm text-on-spot opacity-90">
          {t('me.league.endsIn', { count: table.daysLeft })}
        </Text>
      </View>
      <View className="flex-row gap-1.5">
        <View className="flex-1 rounded-[12px] border border-spot-line px-2 py-1.5">
          <Text className="font-sans-black text-xs text-honey">
            {t('me.league.promoteRange', { to: table.promote })}
          </Text>
          <Text className="text-xs text-on-spot">
            {up
              ? t('me.league.promoteTo', { league: t(`me.leagues.${up}`) })
              : t('me.league.staysTop', { league: name })}
          </Text>
        </View>
        <View className="flex-1 rounded-[12px] border border-spot-line px-2 py-1.5">
          <Text className="font-sans-black text-xs text-on-spot">
            {t('me.league.demoteRange', { from: size - table.demote + 1, to: size })}
          </Text>
          <Text className="text-xs text-on-spot">
            {t(down ? 'me.league.demoteTo' : 'me.league.staysTop', {
              league: t(`me.leagues.${down ?? table.league}`),
            })}
          </Text>
        </View>
      </View>
    </View>
  );
}
