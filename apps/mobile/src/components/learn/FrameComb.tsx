import { Pressable, View } from 'react-native';
import type { Hive, HiveTopic, HiveUnit } from '@/features/learn/types';
import { useLearnText } from '@/features/learn/useLearnText';
import { HexComb } from './HexComb';
import { QueenCell } from './QueenCell';
import { TopicCell } from './TopicCell';

type FrameCombProps = {
  hive: Hive;
  unit: HiveUnit;
  online: boolean;
  /** The topic a sheet is open for (ringed like the current one). */
  selectedId?: string;
  onTopic: (topic: HiveTopic) => void;
  onUnitTest: () => void;
};

const CELL = 68;
const CELL_H = Math.round(CELL * 1.125);
const GAP = 6;

/** An open frame's topics as a comb of tappable cells, ending with its unit test cell. */
export function FrameComb({ hive, unit, online, selectedId, onTopic, onUnitTest }: FrameCombProps) {
  const { t, levelAria, levelCaps } = useLearnText();
  const cells = unit.topics.map((topic) => {
    const here = topic.id === hive.currentTopicId;
    const dim = !online && !hive.savedTopicIds.includes(topic.id);
    const aria = [
      t('learn.hive.cellAria', {
        number: topic.number,
        title: topic.title,
        level: levelAria(topic.level),
      }),
      dim ? t('learn.hive.needsInternet') : null,
      here ? t('learn.hive.here') : null,
    ];
    return {
      key: topic.id,
      node: (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={aria.filter(Boolean).join(', ')}
          onPress={() => onTopic(topic)}
          className="active:opacity-80"
        >
          <TopicCell
            level={topic.level}
            number={topic.number}
            word={levelCaps(topic.level)}
            size={CELL}
            ring={here || topic.id === selectedId}
            dim={dim}
          />
        </Pressable>
      ),
    };
  });
  const queenAria = [
    t('learn.hive.queenAria', { number: unit.number, level: levelAria(unit.unitTest.level) }),
    online ? null : t('learn.hive.needsInternet'),
  ];
  cells.push({
    key: `${unit.id}-test`,
    node: (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={queenAria.filter(Boolean).join(', ')}
        onPress={onUnitTest}
        className="active:opacity-80"
      >
        <QueenCell
          level={unit.unitTest.level}
          size={CELL}
          word={t('learn.hive.queenWord')}
          dim={!online}
        />
      </Pressable>
    ),
  });

  return (
    <View
      accessibilityRole="list"
      accessibilityLabel={t('learn.hive.frameCells', { number: unit.number })}
      className="pb-2 pt-0.5"
    >
      <HexComb cells={cells} cellWidth={CELL} cellHeight={CELL_H} gap={GAP} />
    </View>
  );
}
