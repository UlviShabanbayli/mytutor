import { useEffect } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { Mascot } from '@/components/mascot/Mascot';
import { leaveToToday } from '@/features/today/hooks';
import { playCue } from '@/lib/cues';
import { useReducedMotionPref } from '@/motion';
import { GoalDoneProgress } from './GoalDoneProgress';
import { goalCheckAt } from './useGoalRingMotion';

type GoalDoneViewProps = {
  flightDay: number;
  minutes: number;
  cells: number;
  points: number;
  accuracy: number;
};

function Stat({ value, caption }: { value: string; caption: string }) {
  return (
    // White veil on honey: the design's one allowed overlay on the honey ground.
    <View accessible className="flex-1 gap-0.5 rounded-xl bg-white/45 p-3">
      <Text className="font-display-black text-2xl text-on-honey">{value}</Text>
      <Text className="font-sans-bold text-sm text-on-honey">{caption}</Text>
    </View>
  );
}

/** The daily goal reached: Vızı celebrates the day's flight, honey and correct answers. */
export function GoalDoneView({ flightDay, minutes, cells, points, accuracy }: GoalDoneViewProps) {
  const { t } = useTranslation();
  const reduced = useReducedMotionPref();

  // The success tap lands with the ring's check (feedback.goal C).
  useEffect(() => {
    const timer = setTimeout(() => playCue('complete'), reduced ? 0 : goalCheckAt);
    return () => clearTimeout(timer);
  }, [reduced]);

  return (
    <SafeAreaView className="flex-1 bg-honey">
      <ScrollView contentContainerClassName="flex-grow items-center gap-3.5 px-6 pb-6 pt-8">
        <Text className="text-center font-sans-black text-sm uppercase tracking-[1.3px] text-on-honey">
          {t('today.goalDone.overline')}
        </Text>
        <Mascot moment="lessonDone" size={150} decorative />
        <Text variant="title" className="text-center text-on-honey">
          {t('today.goalDone.title', { count: flightDay })}
        </Text>
        <Text className="max-w-[300px] text-center text-md text-on-honey">
          {t('today.goalDone.body', {
            minutes: t('today.goalDone.minutes', { count: minutes }),
            cells: t('today.goalDone.cells', { count: cells }),
          })}
        </Text>
        <GoalDoneProgress goal={minutes} flightDay={flightDay} />
        <View className="flex-row gap-2.5 self-stretch">
          <Stat
            value={t('today.goalDone.points', { count: points })}
            caption={t('today.goalDone.pointsCaption')}
          />
          <Stat
            value={t('today.goalDone.accuracy', { value: accuracy })}
            caption={t('today.goalDone.accuracyCaption')}
          />
        </View>
        <View className="flex-1" />
        <Pressable
          accessibilityRole="button"
          onPress={leaveToToday}
          className="h-[58px] items-center justify-center self-stretch rounded-xl bg-on-honey active:opacity-90"
        >
          <Text className="font-sans-black text-md uppercase tracking-[0.7px] text-honey">
            {t('today.goalDone.continue')}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
