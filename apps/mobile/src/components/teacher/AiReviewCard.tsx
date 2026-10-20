import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, SourceLine, Text } from '@/components/ui';
import type { SubmissionView } from '@mytutor/types';

type AiReviewCardProps = { ai: NonNullable<SubmissionView['ai']>; source: string };

/** The AI's first look at a homework: a suggestion, always marked AI; the teacher decides. */
export function AiReviewCard({ ai, source }: AiReviewCardProps) {
  const { t } = useTranslation();
  const correct = ai.correct.map((n) => `№${n}`).join(', ');

  return (
    <View
      accessibilityLabel={t('teacher.grade.aiLabel')}
      className="gap-1.5 rounded-[18px] bg-info-bg px-3 pb-3 pt-2.5"
    >
      <View className="flex-row flex-wrap items-center gap-2">
        <View className="h-[24px] flex-row items-center gap-1 rounded-full bg-surf px-2">
          <Icon name="bolt" size={14} color="info" />
          <Text className="font-sans-black text-xs text-info">{t('teacher.grade.ai')}</Text>
        </View>
        <Text className="font-sans-bold text-xs text-info">{t('teacher.grade.aiHint')}</Text>
      </View>
      <Text className="font-sans text-sm leading-[20px]">
        {correct
          ? t('teacher.grade.aiCorrect', { list: correct })
          : t('teacher.grade.aiNoneCorrect')}
        {ai.note ? ` ${ai.note}` : ''}{' '}
        <Text className="font-sans-black text-sm">
          {t('teacher.grade.aiSuggest', { grade: ai.suggested.score, max: ai.suggested.max })}
        </Text>
      </Text>
      <SourceLine source={source} />
    </View>
  );
}
