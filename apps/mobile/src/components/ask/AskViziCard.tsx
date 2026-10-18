import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Mascot } from '@/components/mascot/Mascot';
import { Badge, Icon, PressableCard, Text } from '@/components/ui';

type AskViziCardProps = {
  online: boolean;
};

/** "Vızıdan soruş": the AI chat; it needs the internet, so offline it is shown switched off. */
export function AskViziCard({ online }: AskViziCardProps) {
  const { t } = useTranslation();

  if (!online) {
    return (
      <View
        accessible
        accessibilityState={{ disabled: true }}
        accessibilityLabel={`${t('ask.home.viziTitle')}. ${t('ask.home.viziOffline')}`}
        className="flex-row items-center gap-3 rounded-2xl border border-dashed border-border bg-wax p-3.5"
      >
        <View className="h-[52px] w-[52px] items-center justify-center rounded-lg bg-surf">
          <Icon name="chat" size={24} color="lock-ink" />
        </View>
        <View className="min-w-0 flex-1 gap-1">
          <Text className="font-display-bold text-md text-lock-ink">{t('ask.home.viziTitle')}</Text>
          <Text variant="caption" tone="lock" className="font-sans">
            {t('ask.home.viziOffline')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <PressableCard
      accessibilityLabel={t('ask.home.viziA11y')}
      onPress={() => router.push('/chat')}
      className="rounded-2xl"
      contentClassName="flex-row items-center gap-2.5 rounded-2xl py-2.5 pl-2 pr-3.5"
    >
      <Mascot mood="izah" size={76} decorative />
      <View className="min-w-0 flex-1 gap-1">
        <Text className="font-display-black text-lg">{t('ask.home.viziTitle')}</Text>
        <Text tone="muted">{t('ask.home.viziBody')}</Text>
        <View className="mt-0.5 flex-row flex-wrap gap-1.5">
          <Badge label={t('ask.home.viziInstant')} tone="honey" icon="bolt" />
          <Badge label={t('ask.home.viziFromBook')} tone="info" icon="book" />
        </View>
      </View>
      <Icon name="chevron" size={22} color="muted" />
    </PressableCard>
  );
}
