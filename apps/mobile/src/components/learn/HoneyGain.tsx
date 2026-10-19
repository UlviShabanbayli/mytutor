import { useEffect } from 'react';
import { View } from 'react-native';
import { Icon, Text } from '@/components/ui';
import { cellTimeline } from '@/components/ui/hex/levelChange';
import { playCue } from '@/lib/cues';
import { useLearnText } from '@/features/learn/useLearnText';
import { Appear } from './Appear';

type HoneyGainProps = {
  /** Honey drops won. */
  points: number;
  /** When the chip rises, in ms; by default as in hive.nectar-honey C (with the cell's fill). */
  delay?: number;
  duration?: number;
  /** Plays the success cue as the chip lands (off when the screen plays its own). */
  cue?: boolean;
};

/** The chip lands at 45% of its rise (it overshoots, then settles). */
const LANDS_AT = 0.45;

/**
 * "+20 bal": a honey-drop chip that rises from a cell and settles beside it (hive.nectar-honey
 * C). Place it next to a `HexCell` that animates to `mastered`.
 */
export function HoneyGain({
  points,
  delay = cellTimeline.honey.chip[0],
  duration = cellTimeline.honey.chip[1],
  cue = true,
}: HoneyGainProps) {
  const { t } = useLearnText();
  useEffect(() => {
    if (!cue) return;
    const id = setTimeout(() => playCue('reward'), delay + duration * LANDS_AT);
    return () => clearTimeout(id);
  }, [cue, delay, duration]);

  return (
    <Appear
      from={{ opacity: 0, y: 26, scale: 0.6 }}
      via={{ y: -6, scale: 1.05, at: LANDS_AT }}
      delay={delay}
      duration={duration}
    >
      <View className="h-7 flex-row items-center gap-1 self-start rounded-full bg-raised pl-[7px] pr-2.5">
        <Icon name="drop" size={15} color="honey" />
        <Text className="font-sans-black text-sm text-honey-text">
          {t('learn.gain', { count: points })}
        </Text>
      </View>
    </Appear>
  );
}
