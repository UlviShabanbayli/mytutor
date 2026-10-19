import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { useTodayStore } from '@/features/today/store';
import type { FirstStep } from '@/features/today/types';
import { cn } from '@/lib/cn';

type FirstStepCardProps = {
  step: FirstStep;
};

/** First day: test what you know ("Bilirəm, yoxla") or start from the first topic. */
export function FirstStepCard({ step }: FirstStepCardProps) {
  const { t } = useTranslation();
  const takeFirstStep = useTodayStore((s) => s.takeFirstStep);

  const placement = () => {
    takeFirstStep();
    router.push({ pathname: '/placement/[subjectId]', params: { subjectId: step.subjectId } });
  };
  const fromStart = () => {
    takeFirstStep();
    router.push({ pathname: '/topic/[id]', params: { id: step.firstTopicId } });
  };

  return (
    <View className="gap-3 rounded-xl bg-spot p-4">
      <Text className="font-sans-black text-xs uppercase tracking-[1px] text-honey">
        {t('today.firstDay.overline')}
      </Text>
      <Text variant="heading" className="text-on-spot">
        {t('today.firstDay.title', { subject: step.subject })}
      </Text>
      <Text className="text-on-spot opacity-85">
        {t('today.firstDay.body', { minutes: step.placementMinutes })}
      </Text>
      <View className="flex-row gap-2">
        <Pressable
          accessibilityRole="button"
          onPress={placement}
          className="flex-1 rounded-md bg-honey-deep pb-[3px]"
        >
          {({ pressed }) => (
            <View
              className={cn(
                'min-h-[50px] items-center justify-center rounded-md bg-honey px-2',
                pressed && 'translate-y-[3px]',
              )}
            >
              <Text className="text-center font-sans-black text-on-honey">
                {t('today.firstDay.placement')}
              </Text>
            </View>
          )}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={fromStart}
          className="min-h-[53px] flex-1 items-center justify-center rounded-md border-2 border-spot-line px-2 active:opacity-80"
        >
          <Text className="text-center font-sans-black text-on-spot">
            {t('today.firstDay.fromStart')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
