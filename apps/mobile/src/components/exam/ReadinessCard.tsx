import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { subjectName } from '@/features/exam/labels';
import type { SubjectReadiness } from '@/features/exam/types';
import { ReadinessRing } from './ReadinessRing';

type ReadinessCardProps = {
  subjects: SubjectReadiness[];
};

const levelKey = (percent: number) => (percent < 50 ? 'low' : percent < 75 ? 'mid' : 'high');

/** Readiness per exam subject: a ring where content exists, "hazırlanır" for the rest. */
export function ReadinessCard({ subjects }: ReadinessCardProps) {
  const { t } = useTranslation();
  const ready = subjects.filter((s) => s.ready);
  const preparing = subjects.filter((s) => !s.ready);

  return (
    <View
      accessibilityLabel={t('exam.home.readinessA11y')}
      className="gap-2 rounded-xl border border-border bg-surf px-3 py-2.5"
    >
      <View className="flex-row items-baseline justify-between gap-2">
        <Text className="font-sans-black text-base">{t('exam.home.readinessTitle')}</Text>
        <Text tone="muted" className="min-w-0 flex-shrink text-right font-sans-semibold text-xs">
          {t('exam.home.readinessCaption')}
        </Text>
      </View>
      <View className="flex-row items-center gap-3">
        {ready.map((s) => {
          if (!s.ready) return null;
          const level = t(`exam.home.readyLevel.${levelKey(s.percent)}`);
          const name = subjectName(t, s.subject);
          return (
            <View
              key={s.subject}
              accessible
              accessibilityLabel={t('exam.home.readyA11y', {
                subject: name,
                percent: s.percent,
                level,
              })}
              className="min-w-0 flex-1 flex-row items-center gap-2.5"
            >
              <ReadinessRing percent={s.percent} />
              <View className="min-w-0 flex-1">
                <Text className="font-sans-black text-base">{name}</Text>
                <Text className="font-sans-bold text-xs text-honey-text">
                  {t('exam.home.readyMeta', {
                    level,
                    weak: t('exam.weakCount', { count: s.weakCount }),
                  })}
                </Text>
              </View>
            </View>
          );
        })}
        {ready.length > 0 && preparing.length > 0 ? (
          <View className="w-px self-stretch bg-border" />
        ) : null}
        {preparing.length > 0 ? (
          <View className="min-w-0 flex-1 gap-1.5">
            {preparing.map((s) => {
              const name = subjectName(t, s.subject);
              return (
                <View
                  key={s.subject}
                  accessible
                  accessibilityLabel={t('exam.home.preparingA11y', { subject: name })}
                  className="flex-row items-center gap-2"
                >
                  <View className="h-[18px] w-[18px] rounded-full border-2 border-dashed border-lock-ink" />
                  {/* "hazırlanır" goes under the name, so a long subject name keeps the row. */}
                  <View className="min-w-0 flex-1">
                    <Text numberOfLines={1} className="font-sans-bold text-sm text-lock-ink">
                      {name}
                    </Text>
                    <Text className="font-sans-semibold text-2xs text-lock-ink">
                      {t('exam.home.preparing')}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}
      </View>
    </View>
  );
}
