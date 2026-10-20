import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { playCue } from '@/lib/cues';
import { cn } from '@/lib/cn';
import { digitsByKey, groupThousands, rollDuration, rollingSlots } from '@/lib/rolling';
import { useReducedMotionPref } from '@/motion';
import { RollingDigit } from './RollingDigit';
import { Text } from './Text';

/** micro.count B: digits start 70ms apart, left to right, and settle in about 700ms. */
const STAGGER = 70;
const SETTLE = 700;

type RollingNumberProps = {
  value: number;
  /** Thousands with a no-break space: 2140 → "2 140". */
  group?: boolean;
  /** Text before or after the number that does not roll, e.g. "+" or "%". */
  prefix?: string;
  suffix?: string;
  /** Classes of the number's text: font, size and colour. */
  className?: string;
  /** Roll up from zero when first shown (default), or appear still. */
  rollIn?: boolean;
  /** The first roll starts from this value instead of zero (e.g. the minutes before a lesson). */
  from?: number;
  /** Waits this long before each roll, in ms (e.g. until the tile around it has popped in). */
  delay?: number;
  /** The selection tick when a change settles; off where the moment plays its own cue. */
  cue?: boolean;
  /**
   * Spoken instead of the number. Set `accessible={false}` when a parent already reads the
   * value; the rolling strips themselves are always hidden from screen readers.
   */
  accessibilityLabel?: string;
  accessible?: boolean;
};

/**
 * A number whose digits roll like a counter when it changes (micro.count B · Diyircək). Screen
 * readers get the final value at once; a selection tick follows the last digit of a change.
 */
export function RollingNumber({
  value,
  group = false,
  prefix = '',
  suffix = '',
  className,
  rollIn = true,
  from,
  delay = 0,
  cue = true,
  accessibilityLabel,
  accessible = true,
}: RollingNumberProps) {
  const reduced = useReducedMotionPref();
  const format = (n: number) =>
    `${prefix}${group ? groupThousands(n) : String(Math.round(n))}${suffix}`;
  const text = format(value);
  const slots = rollingSlots(text);
  const digits = slots.filter((s) => s.digit !== null).length;
  const [lineHeight, setLineHeight] = useState(0);
  // Columns of the first value may appear still (`rollIn={false}`); later ones always roll.
  const [start] = useState(value);
  // Where each column of the first value starts: zero, or the digit `from` has there.
  const [startDigits] = useState(() => (from === undefined ? {} : digitsByKey(format(from))));
  const shown = useRef<number | null>(null);

  // A change after the first value ends with a tick once the last digit has settled.
  useEffect(() => {
    const before = shown.current;
    shown.current = value;
    if (!cue || before === null || before === value) return;
    const timer = setTimeout(
      () => playCue('select'),
      reduced ? 0 : delay + rollDuration(digits, STAGGER, SETTLE),
    );
    return () => clearTimeout(timer);
  }, [value, digits, reduced, cue, delay]);

  const first = value === start;
  return (
    <View
      accessible={accessible}
      accessibilityRole={accessible ? 'text' : undefined}
      accessibilityLabel={accessible ? (accessibilityLabel ?? text) : undefined}
      className="flex-row"
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        className="flex-row"
      >
        {/* One invisible line measures the strip height for this text style. */}
        <Text
          className={cn(className, 'absolute opacity-0')}
          onLayout={(e) => setLineHeight(e.nativeEvent.layout.height)}
        >
          0
        </Text>
        {lineHeight === 0 ? (
          <Text className={className}>{first && from !== undefined ? format(from) : text}</Text>
        ) : (
          slots.map((slot) =>
            slot.digit === null ? (
              <Text key={slot.key} className={className}>
                {slot.char}
              </Text>
            ) : (
              <RollingDigit
                key={slot.key}
                digit={slot.digit}
                initial={!first ? 0 : rollIn ? (startDigits[slot.key] ?? 0) : slot.digit}
                lineHeight={lineHeight}
                delay={delay + slot.order * STAGGER}
                reduced={reduced}
                className={className}
              />
            ),
          )
        )}
      </View>
    </View>
  );
}
