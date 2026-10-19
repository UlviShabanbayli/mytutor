import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type ReminderToggleProps = {
  on: boolean;
  onChange: (on: boolean) => void;
};

/** Deadline reminders on or off: the whole row is the switch. */
export function ReminderToggle({ on, onChange }: ReminderToggleProps) {
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={`${t('exam.deadlines.reminders')}, ${t('exam.deadlines.remindersBody')}`}
      accessibilityState={{ checked: on }}
      onPress={() => onChange(!on)}
      className="flex-row items-center gap-3 rounded-xl border border-border bg-surf px-3 py-2.5"
    >
      <View className="h-10 w-10 items-center justify-center rounded-sm bg-raised">
        <Icon name="bell" size={22} color="honey-text" />
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <Text className="font-sans-black text-base">{t('exam.deadlines.reminders')}</Text>
        <Text tone="muted" className="text-xs">
          {t('exam.deadlines.remindersBody')}
        </Text>
      </View>
      <View
        className={cn(
          'h-8 w-[52px] justify-center rounded-full p-[3px]',
          on ? 'items-end bg-honey' : 'items-start bg-wax',
        )}
      >
        <View className="h-[26px] w-[26px] items-center justify-center rounded-full bg-surf">
          {on ? <Icon name="check" size={14} color="honey-text" /> : null}
        </View>
      </View>
    </Pressable>
  );
}
