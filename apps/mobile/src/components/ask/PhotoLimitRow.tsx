import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, RollingNumber, Text } from '@/components/ui';
import type { AskUsage } from '@/features/ask/types';
import { HexBadge } from './HexBadge';

type PhotoLimitRowProps = {
  usage: AskUsage;
};

/** Today's free photo questions as honey cells, with the way to premium (a calm lock). */
export function PhotoLimitRow({ usage }: PhotoLimitRowProps) {
  const { t } = useTranslation();
  const cells = Array.from({ length: usage.photoLimit }, (_, i) => i < usage.photoUsed);

  return (
    <View
      accessibilityLabel={t('ask.home.limitLabel')}
      className="flex-row items-center gap-2.5 rounded-lg bg-raised py-1.5 pl-3 pr-1.5"
    >
      <View className="flex-row gap-[3px]">
        {cells.map((used, i) => (
          <HexBadge key={i} size={14} fill={used ? 'honey' : 'wax'} />
        ))}
      </View>
      <View className="min-w-0 flex-1 gap-px">
        <View
          accessible
          accessibilityLabel={t('ask.home.limitUsed', {
            used: usage.photoUsed,
            limit: usage.photoLimit,
          })}
          // Words wrap as whole pieces, so a narrow row reads "Bu gün: 2 / 3" + the noun below.
          className="flex-row flex-wrap items-end gap-x-1"
        >
          <Text className="font-sans-black text-sm">{t('ask.home.limitUsedBefore')}</Text>
          <RollingNumber
            value={usage.photoUsed}
            accessible={false}
            className="font-sans-black text-sm"
          />
          <Text className="font-sans-black text-sm">
            {t('ask.home.limitUsedOf', { limit: usage.photoLimit })}
          </Text>
          <Text className="font-sans-black text-sm">{t('ask.home.limitUsedAfter')}</Text>
        </View>
        <Text variant="caption" tone="muted" className="font-sans text-xs">
          {t('ask.home.limitReset')}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('ask.home.premiumA11y')}
        onPress={() => router.push('/me/subscription')}
        className="min-h-touch flex-row items-center gap-1 rounded-md px-2.5 active:bg-wax"
      >
        <Icon name="lock" size={15} color="honey-text" />
        <Text className="font-sans-black text-sm text-honey-text">{t('ask.home.premium')}</Text>
      </Pressable>
    </View>
  );
}
