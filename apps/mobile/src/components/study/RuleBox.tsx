import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';

/** The rule of the lesson: honey-framed box with the formulas, one per line. */
export function RuleBox({ lines }: { lines: string[] }) {
  const { t } = useTranslation();
  return (
    <View
      accessibilityLabel={t('study.lesson.rule')}
      className="gap-2 rounded-xl border-2 border-honey bg-raised px-3.5 py-3"
    >
      <View className="flex-row items-center gap-1.5">
        <Icon name="star" size={16} color="honey-text" />
        <Text variant="overline" tone="honey">
          {t('study.lesson.rule')}
        </Text>
      </View>
      {lines.map((line) => (
        <Text key={line} className="font-sans-bold text-lg">
          {line}
        </Text>
      ))}
    </View>
  );
}
