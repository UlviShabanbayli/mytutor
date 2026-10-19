import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { formatWhen } from '@/features/me/format';
import type { AssignmentDetail } from '@/features/me/types';
import { Hex } from './Hex';

type TeacherFeedbackProps = { feedback: NonNullable<AssignmentDetail['feedback']> };

/** The teacher's grade and comment on a checked homework. */
export function TeacherFeedback({ feedback }: TeacherFeedbackProps) {
  const { t } = useTranslation();

  return (
    <View
      accessibilityLabel={t('me.assignment.feedbackLabel')}
      className="gap-2 rounded-[18px] bg-ok-bg px-3.5 py-3"
    >
      <View className="flex-row items-center gap-2.5">
        <Hex width={34} fill="spot">
          <Text className="font-sans-black text-xs text-honey">{feedback.initials}</Text>
        </Hex>
        <View className="flex-1">
          <Text className="font-sans-black text-sm">{feedback.teacher}</Text>
          <Text className="font-sans-bold text-xs text-ok">
            {t('me.assignment.feedbackMeta', { when: formatWhen(t, feedback.time) })}
          </Text>
        </View>
        <View
          accessible
          accessibilityLabel={t('me.assignment.scoreLabel', {
            score: feedback.score,
            max: feedback.max,
          })}
          className="flex-row items-baseline"
        >
          <Text className="font-display-black text-2xl text-ok">{feedback.score}</Text>
          <Text className="font-sans-black text-sm text-ok">{`/${feedback.max}`}</Text>
        </View>
      </View>
      <Text className="text-sm leading-[21px]">{feedback.text}</Text>
    </View>
  );
}
