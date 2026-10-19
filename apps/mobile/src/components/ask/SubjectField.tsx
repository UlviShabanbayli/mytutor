import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';

type SubjectFieldProps = {
  /** "Riyaziyyat · 7-ci sinif". */
  value: string;
  onPress: () => void;
};

/** The chosen subject and grade; opens the picker. */
export function SubjectField({ value, onPress }: SubjectFieldProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-1.5">
      <Text variant="overline" tone="muted" className="text-xs">
        {t('ask.send.subject')}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('ask.send.subjectA11y', { value })}
        onPress={onPress}
        className="min-h-[54px] flex-row items-center gap-2.5 rounded-md border-2 border-honey bg-raised px-3 py-1.5"
      >
        <Icon name="book" size={20} color="honey-text" />
        <View className="min-w-0 flex-1 gap-px">
          <Text className="font-sans-black">{value}</Text>
          <Text variant="caption" tone="muted" className="text-xs">
            {t('ask.send.subjectHint')}
          </Text>
        </View>
        <View className="flex-row items-center gap-0.5">
          <Text className="font-sans-black text-sm text-honey-text">{t('ask.send.change')}</Text>
          <Icon name="down" size={16} color="honey-text" />
        </View>
      </Pressable>
    </View>
  );
}
