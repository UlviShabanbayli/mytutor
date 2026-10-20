import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, DepthDialog, Icon, SuccessCheck, Text } from '@/components/ui';

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
        {/* micro.done A: the answers given so far are safe. */}
        <SuccessCheck layout="row" body={t('study.test.saved', { count: answered })} />
        <View className="flex-row items-center gap-3">
          {/* As wide as the check's 40pt mark, so both lines start together. */}
          <View className="w-10 items-center">
            <Icon name="clock" size={20} color="honey-text" />
          </View>
          <Text className="flex-1 text-sm">{t('exam.run.exitClock')}</Text>
        </View>
      </View>
      <Button label={t('study.common.continue')} onPress={onStay} />
      <Button label={t('exam.run.exit')} variant="secondary" onPress={onLeave} />
    </DepthDialog>
  );
}
