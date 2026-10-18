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
};

/** Close, the progress bar with "4/10", and the kind of test under them. */
export function TestSessionHeader({ kind, index, total, onClose }: TestSessionHeaderProps) {
  const { t } = useTranslation();
  return (
    <View className="gap-0.5 pb-1">
      <View className="flex-row items-center gap-2 px-2">
        <IconButton icon="close" accessibilityLabel={t('study.test.exit')} onPress={onClose} />
        <SessionProgress index={index} total={total} />
      </View>
      <View className="px-4">
        <Badge label={kind} tone="honey" />
      </View>
    </View>
  );
}
