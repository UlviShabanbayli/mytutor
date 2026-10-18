import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Icon, Sheet, Text } from '@/components/ui';

type CameraTipsSheetProps = {
  visible: boolean;
  onClose: () => void;
};

const TIP_KEYS = [
  'ask.camera.tipsList.0',
  'ask.camera.tipsList.1',
  'ask.camera.tipsList.2',
  'ask.camera.tipsList.3',
] as const;

/** Four short rules for a photo a teacher can read. */
export function CameraTipsSheet({ visible, onClose }: CameraTipsSheetProps) {
  const { t } = useTranslation();

  return (
    <Sheet visible={visible} onClose={onClose} title={t('ask.camera.tips')}>
      <View className="gap-3">
        {TIP_KEYS.map((key) => (
          <View key={key} className="flex-row items-start gap-2.5">
            <Icon name="check" size={20} color="ok" />
            <Text className="flex-1">{t(key)}</Text>
          </View>
        ))}
      </View>
      <Button label={t('ask.camera.tipsDone')} variant="secondary" onPress={onClose} />
    </Sheet>
  );
}
