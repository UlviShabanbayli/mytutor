import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Mascot } from '@/components/mascot/Mascot';
import { Button, Icon, Text } from '@/components/ui';

const BENEFITS = ['benefitSync', 'benefitClasses', 'benefitLeague', 'benefitParent'] as const;

/** The guest's invitation: what a free account adds, "Hesab aç" and "Artıq hesabım var". */
export function GuestAccountCard() {
  const { t } = useTranslation();

  return (
    <View
      accessibilityLabel={t('me.guest.cardLabel')}
      className="gap-2.5 rounded-xl bg-spot px-4 pb-4 pt-3.5"
    >
      <View className="flex-row items-center gap-2">
        <View className="flex-1 gap-1">
          <Text variant="overline" className="text-honey">
            {t('me.guest.overline')}
          </Text>
          <Text accessibilityRole="header" className="font-display-bold text-md text-on-spot">
            {t('me.guest.title')}
          </Text>
        </View>
        <Mascot mood="salam" size={64} decorative />
      </View>
      <View className="gap-[7px]">
        {BENEFITS.map((key) => (
          <View key={key} className="flex-row items-center gap-2">
            <Icon name="check" size={18} color="honey" />
            <Text className="flex-1 text-sm text-on-spot">{t(`me.guest.${key}`)}</Text>
          </View>
        ))}
      </View>
      <Button
        label={t('me.guest.create')}
        onPress={() => router.push({ pathname: '/auth/account', params: { reason: 'save' } })}
      />
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/auth/phone')}
        className="min-h-touch items-center justify-center rounded-md active:bg-spot-line"
      >
        <Text className="font-sans-bold text-base text-on-spot">{t('me.guest.signIn')}</Text>
      </Pressable>
    </View>
  );
}
