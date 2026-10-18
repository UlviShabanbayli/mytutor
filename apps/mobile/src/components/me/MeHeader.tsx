import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, IconButton, Text } from '@/components/ui';
import { upperCase } from '@/lib/letterCase';
import { Hex } from './Hex';

type MeHeaderProps = {
  /** Null for a guest: a wax tile with the "me" icon instead of the initial. */
  name: string | null;
  subtitle: string;
  shields?: number;
};

/** Top of the "Mən" tab: hexagon avatar, name, nickname and grade, shields, settings. */
export function MeHeader({ name, subtitle, shields }: MeHeaderProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center gap-3">
      {name ? (
        <Hex width={60} fill="honey" inner={{ fill: 'cap', inset: 5 }}>
          <Text className="font-display-black text-2xl text-on-honey">
            {upperCase(name.trim().charAt(0), 'az')}
          </Text>
        </Hex>
      ) : (
        <Hex width={60} fill="wax">
          <Icon name="me" size={28} color="lock-ink" />
        </Hex>
      )}
      <View className="flex-1 gap-0.5">
        <Text variant="heading" className="font-display-black text-2xl" numberOfLines={1}>
          {name ?? t('me.guest.name')}
        </Text>
        <Text tone="muted" className="font-sans-semibold text-sm" numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
      {shields !== undefined ? (
        <View
          accessible
          accessibilityLabel={t('me.home.shields', { count: shields })}
          className="h-9 flex-row items-center gap-1 rounded-[12px] bg-info-bg px-2.5"
        >
          <Icon name="shield" size={18} color="info" />
          <Text className="font-sans-black text-base text-info">{shields}</Text>
        </View>
      ) : null}
      <IconButton
        icon="settings"
        variant="outlined"
        accessibilityLabel={t('me.home.settings')}
        onPress={() => router.push('/me/settings')}
      />
    </View>
  );
}
