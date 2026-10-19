import { View } from 'react-native';
import { Icon, Text } from '@/components/ui';
import type { MasteryLevel } from '@/features/learn/types';
import { useLearnText } from '@/features/learn/useLearnText';
import { cn } from '@/lib/cn';
import { levelBg, levelInk, levelText } from './levelStyle';

type LevelPillProps = {
  level: MasteryLevel;
  className?: string;
};

/** "Nektar · Öyrənilir": the level's color, a drop, its name and meaning. */
export function LevelPill({ level, className }: LevelPillProps) {
  const { levelPill } = useLearnText();

  return (
    <View
      className={cn(
        'h-[26px] flex-row items-center gap-1.5 self-start rounded-full px-2.5',
        levelBg[level],
        className,
      )}
    >
      <Icon
        name={level === 'needs_practice' ? 'refresh' : 'drop'}
        size={14}
        color={levelInk[level]}
      />
      <Text className={cn('font-sans-black text-xs', levelText[level])}>{levelPill(level)}</Text>
    </View>
  );
}
