import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card, Icon, Screen, Text } from '@/components/ui';

export default function ProfileScreen() {
  const { t } = useTranslation();

  const rows = [
    { icon: 'language-outline', label: t('profile.language'), value: t('profile.languageName') },
    { icon: 'contrast-outline', label: t('profile.theme'), value: t('profile.themeSystem') },
  ] as const;

  return (
    <Screen>
      <Text variant="title">{t('profile.title')}</Text>
      <View className="items-center gap-2">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-secondary">
          <Icon name="person" size={40} color="secondary-foreground" />
        </View>
        <Text variant="heading">{t('profile.guestName')}</Text>
        <Text tone="muted" className="text-center">
          {t('profile.guestDescription')}
        </Text>
      </View>
      <Card className="gap-1 p-2">
        {rows.map((row) => (
          <View key={row.label} className="min-h-touch flex-row items-center gap-3 px-2 py-2">
            <Icon name={row.icon} color="muted-foreground" />
            <Text className="flex-1 font-sans-medium">{row.label}</Text>
            <Text tone="muted">{row.value}</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}
