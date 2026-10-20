import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import type { ClassTeacher } from '@/features/ask/queries';
import { ANSWER_MINUTES } from '@/features/ask/subjects';
import { initials } from '@/features/ask/labels';
import type { AskQueue } from '@/features/ask/types';
import { cn } from '@/lib/cn';

type AnswererPickerProps = {
  value: AskQueue;
  onChange: (queue: AskQueue) => void;
  /** The teacher of the student's class in this subject, who can answer first; null for none. */
  ownTeacher: ClassTeacher | null;
};

type OptionProps = {
  selected: boolean;
  title: string;
  hint: string;
  avatar: ReactNode;
  onPress: () => void;
};

function Option({ selected, title, hint, avatar, onPress }: OptionProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={`${title}. ${hint}`}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      className={cn('rounded-lg', selected && 'bg-honey-deep pb-[3px]')}
    >
      <View
        className={cn(
          'min-h-[64px] flex-row items-center gap-3 rounded-lg border-2 px-3 py-2',
          selected ? 'border-honey bg-raised' : 'border-border bg-surf',
        )}
      >
        {avatar}
        <View className="min-w-0 flex-1 gap-0.5">
          <Text className="font-sans-black">{title}</Text>
          <Text variant="caption" tone="muted" className="font-sans">
            {hint}
          </Text>
        </View>
        {selected ? (
          <View className="h-6 w-6 items-center justify-center rounded-full bg-honey">
            <Icon name="check" size={14} color="on-honey" />
          </View>
        ) : (
          <View className="h-5 w-5 rounded-full border-2 border-border" />
        )}
      </View>
    </Pressable>
  );
}

/** Who answers: the student's own teacher (when there is one) or the verified teachers' queue. */
export function AnswererPicker({ value, onChange, ownTeacher }: AnswererPickerProps) {
  const { t } = useTranslation();

  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={t('ask.send.who')} className="gap-2">
      <Text variant="overline" tone="muted" className="text-xs">
        {t('ask.send.who')}
      </Text>
      {ownTeacher ? (
        <Option
          selected={value === 'teacher'}
          title={t('ask.send.ownTeacher', {
            teacher: ownTeacher.teacherName,
            className: ownTeacher.className,
          })}
          hint={t('ask.send.ownTeacherHint', { minutes: ANSWER_MINUTES.teacher })}
          avatar={
            <View className="h-10 w-10 items-center justify-center rounded-full bg-honey">
              <Text className="font-sans-black text-sm text-on-honey">
                {initials(ownTeacher.teacherName)}
              </Text>
            </View>
          }
          onPress={() => onChange('teacher')}
        />
      ) : null}
      <Option
        selected={value === 'general' || !ownTeacher}
        title={t('ask.send.general')}
        hint={t('ask.send.generalHint', { minutes: ANSWER_MINUTES.general })}
        avatar={
          <View className="h-10 w-10 items-center justify-center rounded-full bg-wax">
            <Icon name="users" size={20} color="muted" />
          </View>
        }
        onPress={() => onChange('general')}
      />
    </View>
  );
}
