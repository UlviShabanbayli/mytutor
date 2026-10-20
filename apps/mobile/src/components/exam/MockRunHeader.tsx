import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { IconButton, ProgressBar, Text } from '@/components/ui';
import { TimerPill } from './TimerPill';

type MockRunHeaderProps = {
  index: number;
  total: number;
  answered: number;
  remainingMs: number;
  /** The mock's whole time, for the ring around the clock. */
  totalMs: number;
  onExit: () => void;
};

/** Exit, "Sual 7 / 25" with the share answered, and the time left. */
export function MockRunHeader({
  index,
  total,
  answered,
  remainingMs,
  totalMs,
  onExit,
}: MockRunHeaderProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center gap-2 px-3 pb-1.5 pt-1">
      <IconButton icon="close" accessibilityLabel={t('exam.run.exit')} onPress={onExit} />
      <View className="min-w-0 flex-1 gap-1.5">
        <Text className="font-sans-black text-base">
          {t('exam.run.progress', { current: index + 1, total })}
        </Text>
        <ProgressBar
          value={total ? answered / total : 0}
          accessibilityLabel={t('exam.run.progressA11y', { answered, total })}
        />
      </View>
      <TimerPill remainingMs={remainingMs} totalMs={totalMs} announce />
    </View>
  );
}
