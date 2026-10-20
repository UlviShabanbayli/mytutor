import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FadeUp } from '@/components/feedback/FadeUp';
import { scoreC, scoreEnd } from '@/components/feedback/timelines';
import { Mascot } from '@/components/mascot/Mascot';
import { Text } from '@/components/ui';
import { percent, scoreTier } from '@/features/tests/scoring';
import { ScoreHexRing, type ScoreMark } from './ScoreHexRing';

type ResultHeroProps = {
  correct: number;
  total: number;
  /** Every question in order: right, to review, or with the teacher. */
  marks: ScoreMark[];
};

/** The score inside its ring of question cells (feedback.score C), Vızı and a warm line. */
export function ResultHero({ correct, total, marks }: ResultHeroProps) {
  const { t } = useTranslation();
  const tier = scoreTier(percent(correct, total));
  // The line comes in once the ring has popped its last cell and the score.
  const lineAt = scoreEnd(marks.length) + scoreC.outsAfter;

  return (
    <View
      accessible
      accessibilityLabel={`${t('study.result.scoreAria', { correct, total })}. ${t(`study.result.${tier}`)}`}
      className="flex-row items-center gap-3"
    >
      <ScoreHexRing marks={marks} correct={correct} scored={total} />
      <View className="min-w-0 flex-1 items-start gap-1">
        <Mascot moment={tier === 'practice' ? 'wrong' : 'correct'} size={72} decorative />
        <FadeUp delay={lineAt}>
          <Text className="font-sans-semibold">{t(`study.result.${tier}`)}</Text>
        </FadeUp>
      </View>
    </View>
  );
}
