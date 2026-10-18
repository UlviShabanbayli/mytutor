import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Mascot } from '@/components/mascot/Mascot';
import { Text } from '@/components/ui';
import { percent, scoreTier } from '@/features/tests/scoring';

type ResultHeroProps = {
  correct: number;
  total: number;
};

/** Vızı, the score "8 / 10" and a warm line that celebrates the effort. */
export function ResultHero({ correct, total }: ResultHeroProps) {
  const { t } = useTranslation();
  const tier = scoreTier(percent(correct, total));

  return (
    <View
      accessible
      accessibilityLabel={`${t('study.result.scoreAria', { correct, total })}. ${t(`study.result.${tier}`)}`}
      className="flex-row items-center gap-2"
    >
      <Mascot moment={tier === 'practice' ? 'wrong' : 'correct'} size={96} decorative />
      <View className="min-w-0 flex-1 gap-0.5">
        <Text variant="display">{t('study.result.score', { correct, total })}</Text>
        <Text className="font-sans-semibold">{t(`study.result.${tier}`)}</Text>
      </View>
    </View>
  );
}
