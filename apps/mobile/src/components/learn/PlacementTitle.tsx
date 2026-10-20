import { View } from 'react-native';
import { RollingNumber, Text } from '@/components/ui';
import { useLearnText } from '@/features/learn/useLearnText';
import { splitAtNumber } from '@/lib/rolling';

type PlacementTitleProps = {
  /** Cells the check filled. */
  count: number;
  /** How many of them have landed so far (the number rolls with them). */
  shown: number;
};

const titleClass = 'font-display-black text-[26px] leading-[30px]';
const words = (text: string) => text.split(/\s+/).filter(Boolean);

/**
 * "12 hüceyrə doldu" on the check's result: the count rolls as the cells land (micro.count,
 * hive.placement-result C) between the still words. Screen readers hear the final title.
 */
export function PlacementTitle({ count, shown }: PlacementTitleProps) {
  const { t } = useLearnText();
  const title = count > 0 ? t('learn.result.title', { count }) : t('learn.result.titleNone');
  const parts = count > 0 ? splitAtNumber(title, count) : null;

  if (!parts)
    return (
      <Text variant="heading" className={titleClass}>
        {title}
      </Text>
    );
  // One text per word, so the line wraps between words as plain text would.
  const piece = (word: string, key: string) => (
    <Text key={key} className={titleClass}>
      {word}
    </Text>
  );
  return (
    <View
      accessible
      accessibilityRole="header"
      accessibilityLabel={title}
      className="flex-row flex-wrap items-end gap-x-[7px]"
    >
      {words(parts.before).map((word, i) => piece(word, `b${i}`))}
      <RollingNumber value={shown} cue={false} accessible={false} className={titleClass} />
      {words(parts.after).map((word, i) => piece(word, `a${i}`))}
    </View>
  );
}
