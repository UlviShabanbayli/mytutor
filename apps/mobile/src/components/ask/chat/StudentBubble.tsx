import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';

type StudentBubbleProps = {
  text: string;
};

/** The student's message, honey, on the right. */
export function StudentBubble({ text }: StudentBubbleProps) {
  const { t } = useTranslation();

  return (
    <View
      accessible
      accessibilityLabel={`${t('ask.chat.you')}: ${text}`}
      className="max-w-[80%] self-end rounded-xl rounded-br-[4px] bg-honey px-3.5 py-2.5"
    >
      <Text className="font-sans-semibold text-on-honey">{text}</Text>
    </View>
  );
}
