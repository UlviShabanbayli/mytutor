import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge, IconButton } from '@/components/ui';
import { SessionProgress } from './SessionProgress';

type TestSessionHeaderProps = {
  /** "Mövzu testi · 4.3". */
  kind: string;
  index: number;
  total: number;
  /** The current answer has been checked (its progress cell fills). */
  checked: boolean;
  /** The run's points counter, on the right of the kind. */
  points?: ReactNode;
  onClose: () => void;
  /** At the end of the kind's row, e.g. the topic cell that flies to the result. */
  trailing?: ReactNode;
};

/**
 * Close, the progress cells with "4/10", and the kind of test with the run's points and the
 * topic cell that flies to the result under them.
 */
export function TestSessionHeader({
  kind,
  index,
  total,
  checked,
  points,
  onClose,
  trailing,
}: TestSessionHeaderProps) {
  const { t } = useTranslation();
  return (
    // Above the question, so "+10" can slide out under the points counter.
    <View className="z-10 gap-0.5 pb-1">
      <View className="flex-row items-center gap-2 px-2">
        <IconButton icon="close" accessibilityLabel={t('study.test.exit')} onPress={onClose} />
        <SessionProgress index={index} total={total} checked={checked} />
      </View>
      <View className="flex-row items-center justify-between gap-2 px-4">
        <Badge label={kind} tone="honey" />
        <View className="flex-row items-center gap-2">
          {points}
          {trailing}
        </View>
      </View>
    </View>
  );
}
