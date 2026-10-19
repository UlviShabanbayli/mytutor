import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Sheet, Text } from '@/components/ui';
import { REMINDER_TIMES, type ReminderTime } from '@/features/onboarding/reminder';
import { cn } from '@/lib/cn';

type ReminderTimeSheetProps = {
  visible: boolean;
  value: ReminderTime;
  onChange: (time: ReminderTime) => void;
  onClose: () => void;
};

/** A few evening times to pick from; the exact minute is set later in settings. */
export function ReminderTimeSheet({ visible, value, onChange, onClose }: ReminderTimeSheetProps) {
  const { t } = useTranslation();

  return (
    <Sheet visible={visible} onClose={onClose} title={t('onboarding.time.reminder.sheetTitle')}>
      <Text variant="caption" tone="muted" className="font-sans">
        {t('onboarding.time.reminder.sheetNote')}
      </Text>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={t('onboarding.time.reminder.sheetTitle')}
        className="flex-row flex-wrap gap-2"
      >
        {REMINDER_TIMES.map((time) => {
          const selected = time === value;
          return (
            <Pressable
              key={time}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={time}
              onPress={() => {
                onChange(time);
                onClose();
              }}
              className={cn(
                'min-h-touch w-[31%] flex-row items-center justify-center gap-1.5 rounded-md border-2',
                selected ? 'border-honey bg-raised' : 'border-border bg-surf',
              )}
            >
              {selected ? <Icon name="check" size={16} color="honey-text" /> : null}
              <Text className="font-display-bold">{time}</Text>
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}
