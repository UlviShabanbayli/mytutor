import { View } from 'react-native';
import { FadeUp } from '@/components/feedback/FadeUp';
import { rankUpB } from '@/components/feedback/timelines';
import { Text } from '@/components/ui';

type RankUpTitleProps = {
  /** "İşçi arı oldun!" */
  title: string;
};

/**
 * The rank-up title rising word by word, 80ms apart (feedback.rankup B). Screen readers get the
 * whole title once, as a header.
 */
export function RankUpTitle({ title }: RankUpTitleProps) {
  const words = title.split(' ').filter(Boolean);
  return (
    <View
      accessible
      accessibilityRole="header"
      accessibilityLabel={title}
      className="flex-row flex-wrap justify-center gap-x-2.5"
    >
      {words.map((word, i) => (
        <FadeUp key={`${word}${i}`} delay={rankUpB.wordsAt + i * rankUpB.wordStagger}>
          <Text variant="title" className="text-center text-3xl text-on-honey">
            {word}
          </Text>
        </FadeUp>
      ))}
    </View>
  );
}
