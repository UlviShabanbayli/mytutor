import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, SourceLine, Text } from '@/components/ui';
import type { Submission } from '@/features/teacher/types';
import { useTeacherFormat } from '@/features/teacher/useTeacherFormat';

type AiReviewCardProps = { submission: Submission };

/** The AI's first look at a homework: a suggestion, always marked AI; the teacher decides. */
export function AiReviewCard({ submission: s }: AiReviewCardProps) {
  const { t } = useTranslation();
  const f = useTeacherFormat();
  const correct = s.ai.correct.map((n) => `№${n}`).join(', ');

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
        {s.ai.note ? ` ${s.ai.note}` : ''}{' '}
        <Text className="font-sans-black text-sm">
          {t('teacher.grade.aiSuggest', { grade: s.ai.suggested })}
        </Text>
      </Text>
      <SourceLine source={f.source(s.source)} />
    </View>
  );
}
