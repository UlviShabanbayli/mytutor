import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { IconButton, Text } from '@/components/ui';

/** "FƏNLƏR VƏ DƏRSLİKLƏR / Öyrən" with the search button. */
export function LearnHeader() {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-end gap-2">
      <View className="flex-1 gap-0.5">
        <Text variant="overline" tone="muted" className="text-xs">
          {t('learn.tab.overline')}
        </Text>
        <Text variant="title">{t('learn.tab.title')}</Text>
      </View>
      <IconButton
        icon="search"
        variant="outlined"
        accessibilityLabel={t('learn.tab.search')}
        onPress={() => router.push('/search')}
      />
    </View>
  );
}
