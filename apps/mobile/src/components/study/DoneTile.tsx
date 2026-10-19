import { View } from 'react-native';
import { PopIn } from '@/components/feedback/PopIn';
import { lessonDoneB } from '@/components/feedback/timelines';
import { useCountUp } from '@/components/feedback/useCountUp';
import { Text } from '@/components/ui';
import { useReducedMotionPref } from '@/motion';

type DoneTileProps = {
  value: number;
  /** Writes the number as the tile shows it: "+15", "9 dəq". */
  format: (n: number) => string;
  label: string;
  /** When the tile pops, in ms after the screen opens. */
  delay: number;
};

/**
 * A stat on the honey "Dərs bitdi" page (feedback.lessondone B): pops 0.8 → 1 with a small
 * overshoot while its number counts up. Screen readers hear the final value.
 */
export function DoneTile({ value, format, label, delay }: DoneTileProps) {
  const reduced = useReducedMotionPref();
  const shown = useCountUp(value, { duration: lessonDoneB.count, delay, reduced });

  return (
    <PopIn delay={delay} from={lessonDoneB.tileFrom} className="flex-1">
      <View
        accessible
        accessibilityLabel={`${format(value)} ${label}`}
        // White veil on honey: the design's one allowed overlay on the honey ground.
        className="gap-0.5 rounded-xl bg-white/45 px-3 py-2.5"
      >
        <Text className="font-display-black text-xl text-on-honey">{format(shown)}</Text>
        <Text className="font-sans-bold text-sm text-on-honey">{label}</Text>
      </View>
    </PopIn>
  );
}
