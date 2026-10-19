import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';

type ReminderRowProps = {
  time: string;
  onChange: () => void;
};

/** The daily reminder's time with "Dəyiş"; the permission itself is asked after the first lesson. */
export function ReminderRow({ time, onChange }: ReminderRowProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center gap-3 rounded-xl bg-raised py-3 pl-3.5 pr-3">
      <Icon name="bell" size={24} color="honey-text" />
      <View className="min-w-0 flex-1 gap-0.5">
        <Text className="font-sans-black">{t('onboarding.time.reminder.title')}</Text>
        <Text variant="caption" tone="muted" className="font-sans">
          {t('onboarding.time.reminder.note')}
        </Text>
      </View>
      <View className="h-9 flex-row items-center gap-1.5 rounded-md border border-border bg-surf px-3">
        <Icon name="clock" size={16} color="muted" />
        <Text className="font-display-bold">{time}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('onboarding.time.reminder.changeLabel')}
        onPress={onChange}
        className="min-h-touch justify-center px-2 active:opacity-70"
      >
        <Text className="font-sans-black text-sm" tone="honey">
          {t('onboarding.time.reminder.change')}
        </Text>
      </Pressable>
    </View>
  );
}
