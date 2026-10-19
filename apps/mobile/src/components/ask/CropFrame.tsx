import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import { type Corner, moveCrop, resizeCrop } from '@/features/ask/crop';
import type { CropRect } from '@/features/ask/types';
import { cn } from '@/lib/cn';

type CropFrameProps = {
  rect: CropRect;
  /** Size of the photo area in points. */
  width: number;
  height: number;
  onChange: (rect: CropRect) => void;
  /** Called once a drag ends, with the final frame. */
  onCommit: (rect: CropRect) => void;
};

/** Half of the 44pt grab area that sits centred on each corner. */
const GRAB = 22;

const CORNERS: { corner: Corner; marks: string }[] = [
  { corner: 'tl', marks: 'border-l-[6px] border-t-[6px]' },
  { corner: 'tr', marks: 'border-r-[6px] border-t-[6px]' },
  { corner: 'bl', marks: 'border-b-[6px] border-l-[6px]' },
  { corner: 'br', marks: 'border-b-[6px] border-r-[6px]' },
];

/** The crop frame over the photo: drag inside to move it, drag a corner to resize it. */
export function CropFrame({ rect, width, height, onChange, onCommit }: CropFrameProps) {
  // Shared values, not refs: the gesture callbacks read and write them outside render.
  const start = useSharedValue(rect);
  const latest = useSharedValue(rect);

  const pan = (update: (from: CropRect, dx: number, dy: number) => CropRect) =>
    Gesture.Pan()
      .runOnJS(true)
      .onStart(() => {
        start.set(rect);
        latest.set(rect);
      })
      .onUpdate((e) => {
        const next = update(start.get(), e.translationX / width, e.translationY / height);
        latest.set(next);
        onChange(next);
      })
      .onEnd(() => onCommit(latest.get()));

  // Position and size follow the student's drag, so they cannot be static classNames.
  const left = rect.x * width;
  const top = rect.y * height;
  const w = rect.w * width;
  const h = rect.h * height;
  const cornerAt = (c: Corner) => ({
    left: (c === 'tl' || c === 'bl' ? left : left + w) - GRAB,
    top: (c === 'tl' || c === 'tr' ? top : top + h) - GRAB,
  });

  return (
    <View pointerEvents="box-none" className="absolute inset-0">
      {/* Scrim around the frame: above, below, left and right of it. */}
      <View
        pointerEvents="none"
        className="absolute inset-x-0 top-0 bg-scrim"
        style={{ height: top }}
      />
      <View
        pointerEvents="none"
        className="absolute inset-x-0 bottom-0 bg-scrim"
        style={{ top: top + h }}
      />
      <View
        pointerEvents="none"
        className="absolute left-0 bg-scrim"
        style={{ top, height: h, width: left }}
      />
      <View
        pointerEvents="none"
        className="absolute right-0 bg-scrim"
        style={{ top, height: h, left: left + w }}
      />
      <GestureDetector gesture={pan(moveCrop)}>
        <View className="absolute border-2 border-honey" style={{ left, top, width: w, height: h }}>
          <View className="absolute inset-y-0 left-1/3 w-px bg-honey/50" />
          <View className="absolute inset-y-0 left-2/3 w-px bg-honey/50" />
          <View className="absolute inset-x-0 top-1/3 h-px bg-honey/50" />
          <View className="absolute inset-x-0 top-2/3 h-px bg-honey/50" />
        </View>
      </GestureDetector>
      {CORNERS.map(({ corner, marks }) => (
        <GestureDetector
          key={corner}
          gesture={pan((from, dx, dy) => resizeCrop(from, corner, dx, dy))}
        >
          <View className="absolute h-[44px] w-[44px]" style={cornerAt(corner)}>
            <View className={cn('absolute h-6 w-6 border-honey', marks, cornerMark[corner])} />
          </View>
        </GestureDetector>
      ))}
    </View>
  );
}

/** Each L mark starts 5pt outside the frame corner (design), inside its grab area. */
const cornerMark: Record<Corner, string> = {
  tl: 'left-[17px] top-[17px]',
  tr: 'right-[17px] top-[17px]',
  bl: 'bottom-[17px] left-[17px]',
  br: 'bottom-[17px] right-[17px]',
};
