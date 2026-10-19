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
  onClose: () => void;
  /** At the end of the kind's row, e.g. the topic cell that flies to the result. */
  trailing?: ReactNode;
};

/** Close, the progress bar with "4/10", and the kind of test under them. */
export function TestSessionHeader({
  kind,
  index,
  total,
  onClose,
  trailing,
}: TestSessionHeaderProps) {
  const { t } = useTranslation();
  return (
    <View className="gap-0.5 pb-1">
      <View className="flex-row items-center gap-2 px-2">
        <IconButton icon="close" accessibilityLabel={t('study.test.exit')} onPress={onClose} />
        <SessionProgress index={index} total={total} />
      </View>
      <View className="flex-row items-center justify-between px-4">
        <Badge label={kind} tone="honey" />
        {trailing}
      </View>
    </View>
  );
}
