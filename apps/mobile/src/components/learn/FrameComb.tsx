import type { ReactNode } from 'react';
import { View } from 'react-native';
import { frameToggle } from '@/features/learn/hiveMotion';
import type { Hive, HiveTopic, HiveUnit } from '@/features/learn/types';
import { useLearnText } from '@/features/learn/useLearnText';
import { Appear } from './Appear';
import { CombCell } from './CombCell';
import { HexComb } from './HexComb';
import { PressableCell } from './PressableCell';
import { QueenCell } from './QueenCell';

type FrameCombProps = {
  hive: Hive;
  unit: HiveUnit;
  online: boolean;
  /** The topic a sheet is open for (ringed like the current one). */
  selectedId?: string;
  /** The student just opened the frame: cells come in one by one (hive.frame-toggle A). */
  enter: boolean;
  onTopic: (topic: HiveTopic) => void;
  onUnitTest: () => void;
};

const CELL = 68;
const CELL_H = Math.round(CELL * 1.125);
const GAP = 6;

/** An open frame's topics as a comb of tappable cells, ending with its unit test cell. */
export function FrameComb({ hive, unit, online, selectedId, enter, ...on }: FrameCombProps) {
  const { t, levelAria } = useLearnText();
  // In reading order: cells fade in, rise 8pt and grow from 0.9, 45ms apart.
  const entering = (node: ReactNode, i: number) => (
    <Appear
      play={enter}
      from={{ opacity: 0, y: 8, scale: 0.9 }}
      delay={frameToggle.cellFirst + i * frameToggle.cellStep}
      duration={frameToggle.cellIn}
    >
      {node}
    </Appear>
  );
  const cells = unit.topics.map((topic, i) => {
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
      node: entering(
        <CombCell
          topic={topic}
          size={CELL}
          here={here}
          selected={topic.id === selectedId}
          dim={dim}
          accessibilityLabel={aria.filter(Boolean).join(', ')}
          onPress={() => on.onTopic(topic)}
        />,
        i,
      ),
    };
  });
  const queenAria = [
    t('learn.hive.queenAria', { number: unit.number, level: levelAria(unit.unitTest.level) }),
    online ? null : t('learn.hive.needsInternet'),
  ];
  cells.push({
    key: `${unit.id}-test`,
    node: entering(
      <PressableCell
        accessibilityLabel={queenAria.filter(Boolean).join(', ')}
        onPress={on.onUnitTest}
      >
        <QueenCell
          level={unit.unitTest.level}
          size={CELL}
          word={t('learn.hive.queenWord')}
          dim={!online}
        />
      </PressableCell>,
      unit.topics.length,
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
