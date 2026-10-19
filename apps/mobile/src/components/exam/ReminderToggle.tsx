import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, SwitchTrack, Text } from '@/components/ui';
import { playCue } from '@/lib/cues';

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
      onPress={() => {
        playCue('press');
        onChange(!on);
      }}
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
      <SwitchTrack on={on} />
    </Pressable>
  );
}
