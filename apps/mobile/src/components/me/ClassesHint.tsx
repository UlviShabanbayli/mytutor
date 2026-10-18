import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Mascot } from '@/components/mascot/Mascot';
import { Text } from '@/components/ui';

type ClassesHintProps = { empty: boolean };

/** Where classes come from: the teacher's code or link (dashed card with Vızı thinking). */
export function ClassesHint({ empty }: ClassesHintProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center gap-3 rounded-xl border-2 border-dashed border-border p-3.5">
      <Mascot moment="aiThinking" size={76} decorative />
      <View className="flex-1 gap-1">
        <Text className="font-sans-black">
          {empty ? t('me.classes.emptyTitle') : t('me.classes.otherTitle')}
        </Text>
        <Text tone="muted" className="text-sm leading-[19px]">
          {t('me.classes.otherBody')}
        </Text>
      </View>
    </View>
  );
}
