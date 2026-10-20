import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Mascot } from '@/components/mascot/Mascot';
import { Button, DepthDialog, Icon, SuccessCheck, Text } from '@/components/ui';

type TestExitDialogProps = {
  visible: boolean;
  /** Answers already given (they stay saved). */
  answered: number;
  /** 1-based question the student is on. */
  position: number;
  total: number;
  onStay: () => void;
  onLeave: () => void;
};

/**
 * "Testdən çıxırsan?": nothing is lost, the run resumes where it was left. The test behind
 * steps back while the card rises (transitions.dialog C; the test wraps itself in DepthScreen).
 */
export function TestExitDialog({
  visible,
  answered,
  position,
  total,
  onStay,
  onLeave,
}: TestExitDialogProps) {
  const { t } = useTranslation();

  return (
    <DepthDialog visible={visible} onClose={onStay} title={t('study.test.exitTitle')}>
      <View className="items-center gap-3">
        <Mascot moment="aiThinking" size={104} decorative />
        <Text variant="heading" className="text-center font-display-black text-xl">
          {t('study.test.exitTitle')}
        </Text>
        <Text tone="muted" className="text-center">
          {t('study.test.exitBody')}
        </Text>
        <View className="gap-2 self-stretch rounded-lg bg-raised px-3.5 py-3">
          {/* micro.done A: the answers given so far are safe. */}
          <SuccessCheck layout="row" body={t('study.test.saved', { count: answered })} />
          <View className="flex-row items-center gap-3">
            {/* As wide as the check's 40pt mark, so both lines start together. */}
            <View className="w-10 items-center">
              <Icon name="pin" size={20} color="honey-text" />
            </View>
            <Text className="flex-1 text-sm">
              {t('study.test.position', { n: position, total })}
            </Text>
          </View>
        </View>
        <Button label={t('study.common.continue')} onPress={onStay} className="self-stretch" />
        <Button
          label={t('study.test.leave')}
          variant="secondary"
          onPress={onLeave}
          className="self-stretch"
        />
      </View>
    </DepthDialog>
  );
}
