import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Text } from '@/components/ui';
import { Mascot } from '@/components/mascot/Mascot';

type TodayErrorProps = {
  onRetry: () => void;
};

/** The plan could not load: the plain reason, a retry and a way to keep learning. */
export function TodayError({ onRetry }: TodayErrorProps) {
  const { t } = useTranslation();

  return (
    <View accessibilityRole="alert" className="flex-1 items-center justify-center gap-3 px-3 py-8">
      <Mascot moment="wrong" size={150} decorative />
      <Text variant="heading" className="text-center">
        {t('today.error.title')}
      </Text>
      <Text tone="muted" className="text-center">
        {t('today.error.body')}
      </Text>
      <Button
        label={t('today.error.retry')}
        icon="refresh"
        onPress={onRetry}
        className="mt-2 self-stretch"
      />
      <Button
        label={t('today.error.toLearn')}
        variant="secondary"
        size="md"
        onPress={() => router.push('/learn')}
        className="self-stretch"
      />
    </View>
  );
}
