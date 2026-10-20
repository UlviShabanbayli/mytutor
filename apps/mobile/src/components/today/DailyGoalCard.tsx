import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, View, type LayoutRectangle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { streakC } from '@/components/feedback/timelines';
import { Text } from '@/components/ui';
import { todayIndex } from '@/features/tests/progress';
import { useOnline, type Motivation } from '@/features/today/hooks';
import { GoalRing } from './GoalRing';
import { StreakFlyer } from './StreakFlyer';
import { useRiseSinceSeen } from './useRiseSinceSeen';
import { WeekHexRow } from './WeekHexRow';

type DailyGoalCardProps = {
  motivation: Motivation;
  firstDay: boolean;
};

/**
 * Minutes against the daily goal and the week's flight days. Once the goal is reached the card
 * opens today's celebration again. When the student comes back after the day's first lesson or
 * test, Vızı flies over today's cell (feedback.streak C); a goal reached meanwhile completes the
 * ring (feedback.goal C).
 */
export function DailyGoalCard({ motivation, firstDay }: DailyGoalCardProps) {
  const { t } = useTranslation();
  const online = useOnline();
  const { progress, flightDay } = motivation;
  const newDay = useRiseSinceSeen(motivation.streak);
  const minutes = useRiseSinceSeen(progress.done);
  const [card, setCard] = useState<LayoutRectangle | null>(null);
  const [row, setRow] = useState<LayoutRectangle | null>(null);
  const today = todayIndex(new Date());
  const day = t('today.goal.flightDay', { count: flightDay, ordinal: true });
  const note = firstDay
    ? t('today.goal.firstDay')
    : progress.complete
      ? t('today.goal.done', { day })
      : progress.done > 0
        ? t('today.goal.left', { count: progress.left, day })
        : t('today.goal.notStarted');
  const reached = minutes && progress.complete && minutes.from < progress.goal;

  const body = (
    <View
      onLayout={(e) => setCard(e.nativeEvent.layout)}
      className="gap-3 rounded-xl border border-border bg-surf p-3.5"
    >
      <View className="flex-row items-center gap-3.5">
        <GoalRing
          key={minutes?.key}
          progress={progress}
          celebrateFrom={reached ? minutes.from / progress.goal : null}
        />
        <View className="flex-1 gap-0.5">
          <Text variant="subheading" accessibilityRole="header">
            {t('today.goal.title')}
          </Text>
          <Text tone="muted" className="text-sm">
            {note}
          </Text>
        </View>
      </View>
      <WeekHexRow
        week={motivation.week}
        fillToday={newDay ? { index: today, at: streakC.startAt + streakC.fillAt } : null}
        onLayout={setRow}
      />
      {/* Offline, "Bu gün" already shows Vızı on the offline card: one Vızı per screen. */}
      {newDay && online && card && row ? (
        <StreakFlyer
          key={newDay.key}
          card={card}
          hex={{ x: row.x + ((today + 0.5) * row.width) / 7, y: row.y + 17 }}
        />
      ) : null}
    </View>
  );

  if (!progress.complete) return body;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${t('today.goal.title')}. ${note}`}
      accessibilityHint={t('today.goal.openDone')}
      onPress={() => router.push('/goal-done')}
      className="rounded-xl active:opacity-80"
    >
      {body}
    </Pressable>
  );
}
