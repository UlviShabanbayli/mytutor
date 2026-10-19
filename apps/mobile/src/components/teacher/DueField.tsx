import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Sheet, Text } from '@/components/ui';
import { clockTime, dayOffset, dueAtOffset } from '@/features/teacher/time';
import { useTeacherFormat } from '@/features/teacher/useTeacherFormat';
import { Overline } from './Overline';

/** Due dates offered: end of today, tomorrow, in 3 days, in a week (23:59). */
const OFFSETS = [0, 1, 3, 7];

type DueFieldProps = { value: Date; onChange: (date: Date) => void };

/** "Son tarix": a field that opens a sheet of the usual due dates. */
export function DueField({ value, onChange }: DueFieldProps) {
  const { t } = useTranslation();
  const f = useTeacherFormat();
  const [open, setOpen] = useState(false);
  const label = (d: Date) => {
    const days = dayOffset(d, new Date());
    const parts = { date: f.date(d), time: clockTime(d) };
    if (days <= 0) return t('teacher.assign.dueToday', parts);
    if (days === 1) return t('teacher.assign.dueTomorrow', parts);
    return t('teacher.assign.dueIn', { ...parts, count: days });
  };

  return (
    <View className="gap-1.5">
      <Overline>{t('teacher.assign.due')}</Overline>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${t('teacher.assign.dueSheet')}: ${label(value)}`}
        onPress={() => setOpen(true)}
        className="h-[50px] flex-row items-center gap-2.5 rounded-md border-2 border-border bg-surf px-3.5 active:opacity-80"
      >
        <Icon name="calendar" size={20} color="honey-text" />
        <Text className="flex-1 font-sans-bold">{label(value)}</Text>
        <Icon name="down" size={20} color="muted" />
      </Pressable>
      <Sheet visible={open} onClose={() => setOpen(false)} title={t('teacher.assign.dueSheet')}>
        <View accessibilityRole="radiogroup" className="gap-2">
          {OFFSETS.map((days) => {
            const d = dueAtOffset(days);
            const on = dayOffset(d, value) === 0;
            return (
              <Pressable
                key={days}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                onPress={() => {
                  onChange(d);
                  setOpen(false);
                }}
                className="min-h-touch flex-row items-center gap-3 rounded-md border border-border bg-page px-3"
              >
                <Text className="flex-1 font-sans-bold">{label(d)}</Text>
                {on ? <Icon name="check" size={20} color="honey-text" /> : null}
              </Pressable>
            );
          })}
        </View>
      </Sheet>
    </View>
  );
}
