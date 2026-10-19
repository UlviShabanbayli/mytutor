import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';

/** A guest's progress lives on this phone; an account keeps it safe. */
export function GuestAccountCard() {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center gap-3 rounded-lg bg-info-bg px-3.5 py-3">
      <Icon name="shield" size={26} color="info" />
      <View className="min-w-0 flex-1 gap-0.5">
        <Text className="font-sans-black">{t('today.guest.title')}</Text>
        <Text tone="muted" className="text-sm">
          {t('today.guest.body')}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/auth/phone')}
        className="h-[44px] shrink-0 items-center justify-center rounded-sm border-2 border-info px-3.5 active:opacity-70"
      >
        <Text className="font-sans-black text-sm text-info">{t('today.guest.action')}</Text>
      </Pressable>
    </View>
  );
}
