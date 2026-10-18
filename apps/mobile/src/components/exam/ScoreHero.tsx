import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Mascot } from '@/components/mascot/Mascot';
import { Text } from '@/components/ui';

type ScoreHeroProps = {
  score: number;
};

/** The estimated score out of 100 on honey; Vızı celebrates effort, or comforts below 60. */
export function ScoreHero({ score }: ScoreHeroProps) {
  const { t } = useTranslation();

  return (
    <View
      accessible
      accessibilityLabel={`${t('exam.result.scoreA11y', { score })}. ${t('exam.result.scoreNote')}`}
      className="flex-row items-center gap-2 rounded-2xl bg-honey py-3 pl-4 pr-3.5"
    >
      <View className="min-w-0 flex-1 gap-0.5">
        <Text variant="overline" className="text-xs text-on-honey">
          {t('exam.result.scoreLabel')}
        </Text>
        <View className="flex-row items-baseline gap-1.5">
          <Text className="font-display-black text-4xl text-on-honey">{String(score)}</Text>
          <Text className="font-sans-black text-base text-on-honey">
            {t('exam.result.scoreOf')}
          </Text>
        </View>
        <Text className="font-sans-semibold text-xs text-on-honey">
          {t('exam.result.scoreNote')}
        </Text>
      </View>
      <Mascot moment={score >= 60 ? 'correct' : 'wrong'} size={96} decorative />
    </View>
  );
}
