import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { QuickActionCard } from '@/components/home/QuickActionCard';
import { EmptyState, Screen, Text } from '@/components/ui';

export default function HomeScreen() {
  const { t } = useTranslation();

  return (
    <Screen>
      <View className="gap-1">
        <Text variant="title">{t('home.greeting')}</Text>
        <Text tone="muted">{t('home.subtitle')}</Text>
      </View>
      <QuickActionCard
        icon="camera-outline"
        title={t('home.askTitle')}
        description={t('home.askDescription')}
        actionLabel={t('home.askAction')}
        onPress={() => router.navigate('/ask')}
      />
      <View className="flex-1 gap-2">
        <Text variant="heading">{t('home.recentTitle')}</Text>
        {/* Replaced by the question list once the ask feature lands. */}
        <EmptyState
          icon="chatbubbles-outline"
          title={t('home.recentEmptyTitle')}
          description={t('home.recentEmptyDescription')}
        />
      </View>
    </Screen>
  );
}
