import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import type { BadgeView } from '@/features/me/types';
import { Hex } from './Hex';

type BadgeStripProps = { badges: BadgeView[]; total: number };

const SHOWN = 4;

/** "Nişanlar 4 / 24": the latest earned badges and a tile that opens all of them. */
export function BadgeStrip({ badges, total }: BadgeStripProps) {
  const { t } = useTranslation();
  const open = () => router.push('/me/badges');
  const left = total - badges.length;

  return (
    <View className="gap-0.5">
      <View className="flex-row items-center justify-between">
        <Text accessibilityRole="header" className="font-display-bold text-base">
          {t('me.home.badgesTitle')}{' '}
          <Text className="font-sans-bold text-sm text-muted">
            {t('me.home.badgesCount', { earned: badges.length, total })}
          </Text>
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('me.home.badgesAllLabel')}
          onPress={open}
          className="min-h-touch flex-row items-center gap-0.5 px-1"
        >
          <Text className="font-sans-black text-sm text-honey-text">{t('me.home.badgesAll')}</Text>
          <Icon name="chevron" size={16} color="honey-text" />
        </Pressable>
      </View>
      <View className="flex-row gap-1.5">
        {badges.slice(0, SHOWN).map((b) => (
          <View
            key={b.id}
            accessible
            accessibilityLabel={t(`me.badges.${b.id}.name`)}
            className="flex-1 items-center gap-1"
          >
            <Hex width={42} fill={b.fill}>
              <Icon name={b.icon} size={22} color={b.ink} />
            </Hex>
            <Text className="font-sans-bold text-2xs text-muted" numberOfLines={1}>
              {t(`me.badges.${b.id}.name`)}
            </Text>
          </View>
        ))}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('me.home.badgesMoreLabel', { count: left })}
          onPress={open}
          className="flex-1 items-center gap-1"
        >
          <Hex width={42} fill="wax">
            <Text className="font-sans-black text-sm text-lock-ink">{`+${left}`}</Text>
          </Hex>
          <Text className="font-sans-bold text-2xs text-muted">{t('me.home.badgesMore')}</Text>
        </Pressable>
      </View>
    </View>
  );
}
