import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatClock } from '@/features/study/time';

type SeekBarProps = {
  /** Seconds played. */
  time: number;
  /** Seconds loaded ahead. */
  buffered: number;
  duration: number;
  onSeek: (seconds: number) => void;
};

const STEP_SECONDS = 10;

/** Thin honey track with a thumb; tap to jump, or swipe up/down with a screen reader (±10 s). */
export function SeekBar({ time, buffered, duration, onSeek }: SeekBarProps) {
  const { t } = useTranslation();
  const [width, setWidth] = useState(0);
  const share = (value: number) => (duration > 0 ? Math.min(1, Math.max(0, value / duration)) : 0);
  const played = `${share(time) * 100}%` as const;
  const loaded = `${share(buffered) * 100}%` as const;

  return (
    <Pressable
      accessibilityRole="adjustable"
      accessibilityLabel={t('study.video.position')}
      accessibilityValue={{
        min: 0,
        max: Math.round(duration),
        now: Math.round(time),
        text: t('study.video.positionValue', {
          current: formatClock(time),
          total: formatClock(duration),
        }),
      }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) =>
        onSeek(time + (e.nativeEvent.actionName === 'increment' ? STEP_SECONDS : -STEP_SECONDS))
      }
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      onPress={(e) => width > 0 && onSeek((e.nativeEvent.locationX / width) * duration)}
      className="min-h-touch justify-center px-1.5"
    >
      <View className="h-1 rounded-full bg-spot-line">
        {/* Widths follow playback, so they cannot be static classes. */}
        <View
          className="absolute inset-y-0 left-0 rounded-full bg-on-spot opacity-35"
          style={{ width: loaded }}
        />
        <View
          className="absolute inset-y-0 left-0 rounded-full bg-honey"
          style={{ width: played }}
        />
        <View
          className="absolute -top-1.5 -ml-2 h-4 w-4 rounded-full bg-honey"
          style={{ left: played }}
        />
      </View>
    </Pressable>
  );
}
