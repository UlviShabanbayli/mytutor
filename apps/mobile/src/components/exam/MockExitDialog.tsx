import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, DepthDialog, Icon, Text } from '@/components/ui';

type MockExitDialogProps = {
  visible: boolean;
  /** Answers already given (they stay saved). */
  answered: number;
  onStay: () => void;
  onLeave: () => void;
};

/**
 * "Sınaqdan çıxırsan?": the answers stay, but the clock keeps running. The mock behind steps
 * back while the card rises (transitions.dialog C).
 */
export function MockExitDialog({ visible, answered, onStay, onLeave }: MockExitDialogProps) {
  const { t } = useTranslation();

  return (
    <DepthDialog visible={visible} onClose={onStay} title={t('exam.run.exitTitle')}>
      <Text variant="heading" className="text-center font-display-black text-xl">
        {t('exam.run.exitTitle')}
      </Text>
      <Text tone="muted" className="text-center">
        {t('exam.run.exitBody')}
      </Text>
      <View className="gap-2 rounded-lg bg-raised px-3.5 py-3">
        <View className="flex-row items-center gap-2.5">
          <Icon name="check" size={20} color="ok" />
          <Text className="flex-1 font-sans-semibold text-sm">
            {t('study.test.saved', { count: answered })}
          </Text>
        </View>
        <View className="flex-row items-center gap-2.5">
          <Icon name="clock" size={20} color="honey-text" />
          <Text className="flex-1 font-sans-semibold text-sm">{t('exam.run.exitClock')}</Text>
        </View>
      </View>
      <Button label={t('study.common.continue')} onPress={onStay} />
      <Button label={t('exam.run.exit')} variant="secondary" onPress={onLeave} />
    </DepthDialog>
  );
}
