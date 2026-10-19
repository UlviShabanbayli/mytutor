import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge, Button, Icon, Text, type IconName } from '@/components/ui';
import { clockTime } from '@/features/exam/calendar';
import { dayMonth, mockTitle, weekdayName } from '@/features/exam/labels';
import type { ScheduledMock } from '@/features/exam/types';

type GeneralMockCardProps = {
  mock: ScheduledMock;
  registered: boolean;
  onRegister: () => void;
  onOpenRules: () => void;
};

/** The scheduled general mock on the inverted card: when, registration, privacy, register. */
export function GeneralMockCard({
  mock,
  registered,
  onRegister,
  onOpenRules,
}: GeneralMockCardProps) {
  const { t } = useTranslation();
  const lines: [IconName, string][] = [
    [
      'calendar',
      t('exam.mocks.when', {
        weekday: weekdayName(t, mock.startsAt),
        date: dayMonth(t, mock.startsAt),
        time: clockTime(mock.startsAt),
      }),
    ],
    [
      'clock',
      t('exam.mocks.registration', {
        date: dayMonth(t, mock.registrationEndsAt),
        time: clockTime(mock.registrationEndsAt),
      }),
    ],
    ['eye', t('exam.mocks.privacy')],
  ];

  return (
    <View
      accessibilityLabel={t('exam.mocks.generalA11y')}
      className="gap-2.5 rounded-2xl bg-spot px-4 pb-4 pt-3.5"
    >
      <View className="flex-row items-center justify-between gap-2">
        <Text variant="overline" className="min-w-0 flex-shrink text-xs text-honey">
          {t('exam.mocks.generalLabel')}
        </Text>
        <View className="h-6 flex-row items-center gap-1 rounded-full bg-spot-line px-2">
          <Icon name="globe" size={14} color="on-spot" />
          <Text className="font-sans-black text-2xs text-on-spot">{t('exam.mocks.online')}</Text>
        </View>
      </View>
      <Text variant="heading" className="text-on-spot">
        {mockTitle(t, { kind: 'scheduled', subject: mock.subject, number: mock.number })}
      </Text>
      <View className="gap-1.5">
        {lines.map(([icon, text]) => (
          <View key={icon} className="flex-row items-center gap-2">
            <Icon name={icon} size={18} color="honey" />
            <Text className="min-w-0 flex-1 text-sm text-on-spot">{text}</Text>
          </View>
        ))}
      </View>
      {registered ? (
        <View className="flex-row items-center justify-between gap-2">
          <Badge
            tone="ok"
            icon="check"
            label={t('exam.mocks.registered')}
            className="self-center"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('exam.mocks.rules')}
            onPress={onOpenRules}
            className="min-h-touch flex-row items-center gap-0.5 px-1 active:opacity-70"
          >
            <Text className="font-sans-black text-sm text-honey">{t('exam.mocks.rules')}</Text>
            <Icon name="chevron" size={16} color="honey" />
          </Pressable>
        </View>
      ) : (
        <Button label={t('exam.mocks.register')} onPress={onRegister} />
      )}
    </View>
  );
}
