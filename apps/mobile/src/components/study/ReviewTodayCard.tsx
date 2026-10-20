import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, HexCell, Text } from '@/components/ui';
import { useReviewStart } from '@/features/study/queries';
import type { ReviewPlan } from '@/features/study/types';
import { HexShape } from './HexShape';

/** The inverted "today" card: the crystallised cells and the short review that warms them. */
export function ReviewTodayCard({ plan }: { plan: ReviewPlan }) {
  const { t } = useTranslation();
  const start = useReviewStart(plan);

  return (
    <View className="gap-3 rounded-xl bg-spot px-4 pb-4 pt-3.5">
      <Text variant="overline" className="text-xs text-honey">
        {t('study.review.today', { count: plan.due.length })}
      </Text>
      <View className="flex-row justify-between gap-2">
        {plan.due.map((cell) => (
          <View
            key={cell.topicId}
            accessible
            accessibilityLabel={`${cell.code} · ${cell.title}`}
            className="min-w-0 flex-1 items-center gap-1.5"
          >
            <HexShape size={64} color="spot-line">
              <HexCell state="needs_practice" size={56} label={cell.code} />
            </HexShape>
            <Text className="text-center font-sans-bold text-xs text-on-spot">{cell.title}</Text>
          </View>
        ))}
      </View>
      <Text className="text-sm text-on-spot opacity-85">
        {t('study.review.todayBody', { count: plan.questionCount })}
      </Text>
      {/* The review practice of the due topics, else their mistakes in "Səhvlərim". */}
      <Button
        label={t('study.review.start', { count: plan.minutes })}
        icon="play"
        disabled={start.pending}
        onPress={() =>
          start.testId
            ? router.push({ pathname: '/test/[id]', params: { id: start.testId } })
            : router.push('/mistakes')
        }
      />
    </View>
  );
}
