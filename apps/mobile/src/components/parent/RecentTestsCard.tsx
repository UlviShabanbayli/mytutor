import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatDayMonth } from '@/features/parent/format';
import type { TestScore } from '@mytutor/types';
import { SectionLabel } from './SectionLabel';

type RecentTestsCardProps = { tests: TestScore[] };

/** The latest test results: practice tests as "7 / 10", unit tests in percent. */
export function RecentTestsCard({ tests }: RecentTestsCardProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-1.5">
      <SectionLabel>{t('parent.subject.tests')}</SectionLabel>
      {tests.length === 0 ? (
        <Text variant="caption" tone="muted">
          {t('parent.subject.noTests')}
        </Text>
      ) : (
        <View
          accessibilityRole="list"
          className="overflow-hidden rounded-lg border border-border bg-surf"
        >
          {tests.map((test, i) => {
            const title =
              test.kind === 'practice'
                ? t('parent.subject.practiceTest', { ref: test.ref })
                : test.kind === 'review'
                  ? t('parent.subject.reviewTest', { ref: test.ref })
                  : t('parent.subject.unitTest', { ref: test.ref });
            const meta = t('parent.subject.testMeta', {
              date: formatDayMonth(t, new Date(test.takenAt), true),
              questions: t('common.questionsCount', { count: test.questions }),
            });
            const score =
              test.kind !== 'unit'
                ? `${test.correct} / ${test.questions}`
                : t('parent.percent', { value: Math.round((test.correct / test.questions) * 100) });
            return (
              <View
                key={test.id}
                accessible
                accessibilityLabel={`${title}, ${meta}, ${score}`}
                className={cn(
                  'flex-row items-center gap-2.5 px-3 py-[9px]',
                  i < tests.length - 1 && 'border-b border-border',
                )}
              >
                <View className="min-w-0 flex-1 gap-px">
                  <Text className="font-sans-black text-sm">{title}</Text>
                  <Text className="text-xs text-muted">{meta}</Text>
                </View>
                <Text className="font-display-bold text-base">{score}</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
