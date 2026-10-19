import { useState } from 'react';
import { type GestureResponderEvent, View } from 'react-native';

type TargetSliderProps = {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  accessibilityLabel: string;
  /** Spoken value, e.g. "75 faiz". */
  valueText: string;
};

const THUMB = 28;

/**
 * A honey track with a round thumb: tap or drag along it, or swipe up/down with a screen
 * reader (an adjustable control). Snaps to `step`.
 */
export function TargetSlider({
  value,
  onChange,
  min,
  max,
  step,
  accessibilityLabel,
  valueText,
}: TargetSliderProps) {
  const [width, setWidth] = useState(0);
  const ratio = (value - min) / (max - min);

  const snap = (raw: number) => Math.min(max, Math.max(min, Math.round(raw / step) * step));
  const pick = (event: GestureResponderEvent) => {
    if (width === 0) return;
    const x = Math.min(width, Math.max(0, event.nativeEvent.locationX));
    onChange(snap(min + (x / width) * (max - min)));
  };

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min, max, now: value, text: valueText }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(event) => {
        const delta = event.nativeEvent.actionName === 'increment' ? step : -step;
        onChange(snap(value + delta));
      }}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onResponderGrant={pick}
      onResponderMove={pick}
      className="h-11 justify-center"
    >
      <View className="pointer-events-none h-2 rounded-full bg-wax" />
      <View
        className="pointer-events-none absolute left-0 h-2 rounded-full bg-honey"
        // Fill and thumb follow the value, so their size and position are data-driven.
        style={{ width: ratio * width }}
      />
      <View
        className="pointer-events-none absolute rounded-full bg-honey-deep pb-0.5"
        style={{ left: ratio * width - THUMB / 2 }}
      >
        <View className="h-[28px] w-[28px] rounded-full border-[3px] border-honey bg-surf" />
      </View>
    </View>
  );
}
