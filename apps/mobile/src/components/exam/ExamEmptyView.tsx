import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Mascot } from '@/components/mascot/Mascot';
import { Button, Text } from '@/components/ui';
import { PerkRow } from './PerkRow';

/** No exam goal yet: what the plan gives and one action, "Hədəf seç". */
export function ExamEmptyView() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 gap-2">
      <View className="items-center gap-2 pt-1">
        <Mascot moment="weakSpot" size={112} decorative />
        <Text variant="heading" className="text-center font-display-black text-xl">
          {t('exam.empty.title')}
        </Text>
        <Text tone="muted" className="text-center">
          {t('exam.empty.body')}
        </Text>
      </View>
      <View accessibilityLabel={t('exam.empty.perks')} className="mt-1 gap-2">
        <PerkRow icon="search" title={t('exam.empty.weakTitle')} body={t('exam.empty.weakBody')} />
        <PerkRow
          icon="calendar"
          title={t('exam.empty.planTitle')}
          body={t('exam.empty.planBody')}
        />
        <PerkRow
          icon="exam"
          title={t('exam.empty.mocksTitle')}
          body={t('exam.empty.mocksBody')}
          highlight
        />
      </View>
      <View className="min-h-4 flex-1" />
      <Button
        label={t('exam.empty.cta')}
        icon="target"
        onPress={() => router.push('/exam/setup')}
      />
      <Text variant="caption" tone="muted" className="text-center">
        {t('exam.empty.note')}
      </Text>
    </View>
  );
}
