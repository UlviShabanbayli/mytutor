import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Icon, StatusPill, Text } from '@/components/ui';
import { minutesLabel } from '@/features/exam/labels';
import { stepHref } from '@/features/exam/links';
import { usePlan } from '@/features/exam/queries';
import { SpeechBubble } from './SpeechBubble';

type ExamLockedViewProps = {
  /** "142 gün" */
  days: string;
};

const GETS = ['exam.locked.gets.0', 'exam.locked.gets.1', 'exam.locked.gets.2'] as const;
const FREE = [
  'exam.locked.free.0',
  'exam.locked.free.1',
  'exam.locked.free.2',
  'exam.locked.free.3',
] as const;

/**
 * The full adaptive plan is premium: a calm lock that names what premium adds, lists what stays
 * free, and still hands over today's one recommended step.
 */
export function ExamLockedView({ days }: ExamLockedViewProps) {
  const { t } = useTranslation();
  const plan = usePlan();
  const tip = plan.data?.plan.today[0];

  return (
    <View className="gap-2.5">
      <View accessibilityLabel={t('exam.locked.a11y')} className="gap-2.5 rounded-2xl bg-spot p-4">
        <View className="flex-row items-center justify-between gap-2">
          <StatusPill kind="premium" label={t('exam.locked.premium')} className="bg-spot-line" />
          <Text className="font-sans-bold text-xs text-on-spot opacity-75">
            {t('exam.locked.daysLeft', { days })}
          </Text>
        </View>
        <Text variant="heading" className="text-on-spot">
          {t('exam.locked.title')}
        </Text>
        <Text className="text-sm text-on-spot opacity-90">{t('exam.locked.body')}</Text>
        <View className="gap-1.5 py-0.5">
          {GETS.map((key) => (
            <View key={key} className="flex-row items-center gap-2">
              <Icon name="star" size={16} color="honey" />
              <Text className="min-w-0 flex-1 font-sans-semibold text-sm text-on-spot">
                {t(key)}
              </Text>
            </View>
          ))}
        </View>
        <Button label={t('exam.locked.cta')} onPress={() => router.push('/me/subscription')} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('exam.locked.parent')}
          onPress={() => router.push('/me/parent-link')}
          className="min-h-touch flex-row items-center justify-center gap-1.5 rounded-md active:opacity-70"
        >
          <Icon name="send" size={18} color="on-spot" />
          <Text className="font-sans-bold text-sm text-on-spot">{t('exam.locked.parent')}</Text>
        </Pressable>
      </View>

      <View
        accessibilityLabel={t('exam.locked.freeA11y')}
        className="gap-2 rounded-xl border border-border bg-surf px-3.5 py-3"
      >
        <Text variant="overline" tone="muted" className="text-xs">
          {t('exam.locked.freeLabel')}
        </Text>
        {FREE.map((key) => (
          <View key={key} className="flex-row items-start gap-2">
            <Icon name="check" size={18} color="ok" />
            <Text className="min-w-0 flex-1 text-sm">{t(key)}</Text>
          </View>
        ))}
      </View>

      {tip ? (
        <SpeechBubble
          moment="wrong"
          size={72}
          tone="raised"
          text={t('exam.locked.tip', { title: tip.title, minutes: minutesLabel(t, tip.minutes) })}
          onPress={() => router.push(stepHref(tip.target))}
        />
      ) : null}
    </View>
  );
}
