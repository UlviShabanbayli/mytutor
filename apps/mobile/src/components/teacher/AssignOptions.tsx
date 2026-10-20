import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Switch, Text } from '@/components/ui';
import { stepValue } from '@/features/teacher/classroom';
import { Overline } from './Overline';
import { Stepper } from './Stepper';

export type AssignSettings = { attempts: number; minutes: number; reminder: boolean };

type AssignOptionsProps = {
  value: AssignSettings;
  onChange: (value: AssignSettings) => void;
  /** Tests and unit tests have attempts, a time limit and questions; lessons and homework not. */
  isTest: boolean;
  questionCount: number;
  topicId: string;
  /** "4.1", for the questions' line. */
  topicNumber: string;
};

/** Attempts and time limit, the questions Vızı picked from the bank, and the reminder. */
export function AssignOptions({
  value,
  onChange,
  isTest,
  questionCount,
  topicId,
  topicNumber,
}: AssignOptionsProps) {
  const { t } = useTranslation();
  const set = (patch: Partial<AssignSettings>) => onChange({ ...value, ...patch });

  return (
    <>
      {isTest ? (
        <View className="flex-row gap-2.5">
          <View accessibilityRole="none" className="min-w-0 flex-1 gap-1.5">
            <Overline>{t('teacher.assign.attempts')}</Overline>
            <Stepper
              value={String(value.attempts)}
              accessibilityLabel={t('teacher.assign.attemptsLabel', { count: value.attempts })}
              lessLabel={t('teacher.assign.attemptsLess')}
              moreLabel={t('teacher.assign.attemptsMore')}
              canLess={value.attempts > 1}
              canMore={value.attempts < 5}
              onLess={() => set({ attempts: stepValue(value.attempts, -1, 1, 5) })}
              onMore={() => set({ attempts: stepValue(value.attempts, 1, 1, 5) })}
            />
          </View>
          <View className="min-w-0 flex-1 gap-1.5">
            <Overline>{t('teacher.assign.time')}</Overline>
            <Stepper
              value={t('teacher.minutesShort', { count: value.minutes })}
              accessibilityLabel={t('teacher.assign.timeLabel', { count: value.minutes })}
              lessLabel={t('teacher.assign.timeLess')}
              moreLabel={t('teacher.assign.timeMore')}
              canLess={value.minutes > 5}
              canMore={value.minutes < 90}
              onLess={() => set({ minutes: stepValue(value.minutes, -5, 5, 90) })}
              onMore={() => set({ minutes: stepValue(value.minutes, 5, 5, 90) })}
            />
          </View>
        </View>
      ) : null}
      <View className="rounded-lg border border-border bg-surf">
        {isTest ? (
          <Pressable
            accessibilityRole="button"
            accessibilityHint={t('teacher.assign.change')}
            onPress={() =>
              router.push({ pathname: '/teacher/test-builder', params: { topic: topicId } })
            }
            className="min-h-[52px] flex-row items-center gap-2.5 border-b border-border px-3 active:bg-raised"
          >
            <Icon name="list" size={20} color="honey-text" />
            <View className="min-w-0 flex-1 py-1.5">
              <Text className="font-sans-black text-sm">
                {t('teacher.assign.questions', { count: questionCount })}
              </Text>
              <Text className="font-sans text-xs text-muted">
                {t('teacher.assign.questionsMeta', { topic: topicNumber })}
              </Text>
            </View>
            <Text className="font-sans-black text-sm text-honey-text">
              {t('teacher.assign.change')}
            </Text>
          </Pressable>
        ) : null}
        <View className="min-h-[52px] flex-row items-center gap-2.5 pl-3 pr-2">
          <Icon name="bell" size={20} color="honey-text" />
          <View className="min-w-0 flex-1 py-1.5">
            <Text className="font-sans-black text-sm">{t('teacher.assign.reminder')}</Text>
            <Text className="font-sans text-xs text-muted">{t('teacher.assign.reminderBody')}</Text>
          </View>
          <Switch
            value={value.reminder}
            onValueChange={(reminder) => set({ reminder })}
            accessibilityLabel={t('teacher.assign.reminder')}
          />
        </View>
      </View>
    </>
  );
}
