import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import type { BadgeView } from '@/features/me/types';
import { Hex } from './Hex';

type BadgeGridProps = { badges: BadgeView[]; locked: number };

/** Earned badges with what they were for, then the locked ones as wax tiles. */
export function BadgeGrid({ badges, locked }: BadgeGridProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-4">
      <View className="gap-2">
        <Text accessibilityRole="header" className="font-display-bold text-base">
          {t('me.badgesPage.earnedTitle')}{' '}
          <Text className="font-sans-bold text-sm text-muted">
            {t('me.badgesPage.earnedCount', { count: badges.length })}
          </Text>
        </Text>
        {badges.map((b) => (
          <View
            key={b.id}
            accessible
            accessibilityLabel={`${t(`me.badges.${b.id}.name`)}: ${t(`me.badges.${b.id}.hint`)}`}
            className="flex-row items-center gap-3 rounded-lg border border-border bg-surf px-3 py-2.5"
          >
            <Hex width={42} fill={b.fill}>
              <Icon name={b.icon} size={22} color={b.ink} />
            </Hex>
            <View className="flex-1 gap-0.5">
              <Text className="font-sans-black">{t(`me.badges.${b.id}.name`)}</Text>
              <Text tone="muted" className="text-sm">
                {t(`me.badges.${b.id}.hint`)}
              </Text>
            </View>
          </View>
        ))}
      </View>
      <View className="gap-2">
        <Text accessibilityRole="header" className="font-display-bold text-base">
          {t('me.badgesPage.lockedTitle')}
        </Text>
        <Text tone="muted" className="text-sm">
          {t('me.badgesPage.lockedBody', { count: locked })}
        </Text>
        <View
          accessible
          accessibilityLabel={t('me.badgesPage.lockedBody', { count: locked })}
          className="flex-row flex-wrap gap-2"
        >
          {Array.from({ length: locked }, (_, i) => (
            <Hex key={i} width={42} fill="wax">
              <Icon name="lock" size={16} color="lock-ink" />
            </Hex>
          ))}
        </View>
      </View>
    </View>
  );
}
