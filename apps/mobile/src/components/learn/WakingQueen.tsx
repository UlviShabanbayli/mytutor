import { View } from 'react-native';
import { HoneyGlow } from '@/components/ui/hex/HoneyGlow';
import { unitSealed } from '@/features/learn/hiveMotion';
import { useReducedMotionPref } from '@/motion';
import { Appear } from './Appear';
import { QueenCell } from './QueenCell';

type WakingQueenProps = {
  size: number;
};

/**
 * The unit test cell on the unit-done page (hive.unit-sealed B): asleep and dim, its cap is
 * traced and fills, then it wakes with a small pop and glows twice.
 */
export function WakingQueen({ size }: WakingQueenProps) {
  const reduced = useReducedMotionPref();
  const [queenAt, queenFor] = unitSealed.queen;
  const [glowAt, glowFor] = unitSealed.glow;

  return (
    <View>
      {reduced ? null : (
        <HoneyGlow w={size} h={Math.round(size * 1.45)} at={glowAt} duration={glowFor} times={2} />
      )}
      <Appear
        from={{ opacity: 0.55, scale: 0.94 }}
        via={{ scale: 1.06, at: 0.6 }}
        delay={queenAt}
        duration={queenFor}
        ease="pop"
      >
        <QueenCell
          level="reinforced"
          size={size}
          animateFrom="mastered"
          animationDelay={unitSealed.queenSeal}
        />
      </Appear>
    </View>
  );
}
