import { useLevelChange } from '@/features/learn/seenLevels';
import type { HiveTopic } from '@/features/learn/types';
import { useLearnText } from '@/features/learn/useLearnText';
import { PressableCell } from './PressableCell';
import { TopicCell } from './TopicCell';

type CombCellProps = {
  topic: HiveTopic;
  size: number;
  /** "Sən buradasan": ringed, and breathes when the frame appears. */
  here: boolean;
  /** A sheet is open for it (ringed like the current one). */
  selected: boolean;
  dim: boolean;
  accessibilityLabel: string;
  onPress: () => void;
};

/**
 * A topic in an open frame: presses like wax, and plays its level change once if the level
 * moved since the student last saw it (hive.fill-nectar, nectar-honey, seal, crystallize).
 */
export function CombCell({ topic, size, here, selected, dim, ...press }: CombCellProps) {
  const { levelCaps } = useLearnText();
  const from = useLevelChange(topic.id, topic.level);

  return (
    <PressableCell {...press}>
      <TopicCell
        level={topic.level}
        number={topic.number}
        word={levelCaps(topic.level)}
        size={size}
        ring={here || selected}
        pulse={here}
        dim={dim}
        animateFrom={from}
        fromWord={from ? levelCaps(from) : undefined}
      />
    </PressableCell>
  );
}
