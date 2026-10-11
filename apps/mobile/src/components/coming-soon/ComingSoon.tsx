import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge, Button, Icon, type IconName, Screen, Text } from '@/components/ui';

type ComingSoonProps = {
  title: string;
  icon: IconName;
  heading: string;
  description: string;
};

/** A tab whose feature is not built yet: what it will do, and a way to keep practising. */
export function ComingSoon({ title, icon, heading, description }: ComingSoonProps) {
  const { t } = useTranslation();

  return (
    <Screen>
      <Text variant="title">{title}</Text>
      <View className="flex-1 items-center justify-center gap-4 px-2 pb-10">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-secondary">
          <Icon name={icon} size={36} color="secondary-foreground" />
        </View>
        <Badge label={t('common.comingSoon')} tone="primary" className="self-center" />
        <Text variant="heading" className="text-center">
          {heading}
        </Text>
        <Text tone="muted" className="max-w-sm text-center">
          {description}
        </Text>
        <Button
          label={t('comingSoon.backToTests')}
          variant="secondary"
          size="md"
          icon="clipboard-outline"
          onPress={() => router.navigate('/tests')}
          className="mt-2 self-stretch"
        />
      </View>
    </Screen>
  );
}
