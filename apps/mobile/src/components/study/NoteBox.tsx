import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';

/** "Diqqət": a calm info box for the common mistake of the topic. */
export function NoteBox({ text }: { text: string }) {
  const { t } = useTranslation();
  return (
    <View
      accessibilityRole="summary"
      className="flex-row gap-2.5 rounded-lg bg-info-bg px-3.5 py-3"
    >
      <Icon name="info" size={20} color="info" />
      <View className="flex-1 gap-1">
        <Text tone="info" className="font-sans-bold">
          {t('study.lesson.note')}
        </Text>
        <Text className="text-sm">{text}</Text>
      </View>
    </View>
  );
}
