import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge, Button, Icon, PressableCard, Text } from '@/components/ui';
import { clockTime } from '@/features/exam/calendar';
import { mockTitle, subjectName, weekdayName } from '@/features/exam/labels';
import type { ScheduledMock } from '@/features/exam/types';

type NextMockCardProps = {
  mock: ScheduledMock;
  registered: boolean;
  offline: boolean;
};

/** The next general mock; offline it waits, because rated mocks run online only. */
export function NextMockCard({ mock, registered, offline }: NextMockCardProps) {
  const { t } = useTranslation();
  const when = t('exam.when', {
    weekday: weekdayName(t, mock.startsAt),
    time: clockTime(mock.startsAt),
  });

  if (offline)
    return (
      <View
        accessibilityLabel={t('exam.home.offlineMockA11y')}
        className="gap-2.5 rounded-xl bg-wax p-3"
      >
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-md bg-surf">
            <Icon name="offline" size={22} color="lock-ink" />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="font-sans-bold text-xs text-lock-ink">
              {t('exam.home.offlineMockLabel', { when, subject: subjectName(t, mock.subject) })}
            </Text>
            <Text className="font-sans-black text-base text-lock-ink">
              {t('exam.home.offlineMockTitle', { number: mock.number })}
            </Text>
          </View>
        </View>
        <Text className="text-sm text-lock-ink">{t('exam.home.offlineMockBody')}</Text>
        <Button
          variant="secondary"
          size="md"
          icon="offline"
          disabled
          label={t('exam.home.offlineMockAction')}
        />
      </View>
    );

  const title = mockTitle(t, { kind: 'scheduled', subject: mock.subject, number: mock.number });
  const label = t('exam.home.nextMockLabel', { when });
  const pill = registered ? t('exam.home.registered') : t('exam.home.registrationOpen');

  return (
    <PressableCard
      accessibilityLabel={`${t('exam.home.nextMockA11y')}: ${title}, ${label}, ${pill}`}
      onPress={() => router.push('/exam/mocks')}
      contentClassName="flex-row items-center gap-3 px-3 py-2.5"
    >
      <View className="h-11 w-11 items-center justify-center rounded-md bg-spot">
        <Icon name="exam" size={22} color="honey" />
      </View>
      <View className="min-w-0 flex-1">
        <Text tone="muted" className="font-sans-bold text-xs">
          {label}
        </Text>
        <Text className="font-sans-black text-base">{title}</Text>
      </View>
      {registered ? (
        <Badge tone="ok" icon="check" label={pill} className="self-center" />
      ) : (
        <Badge tone="honey" label={pill} className="self-center" />
      )}
    </PressableCard>
  );
}
