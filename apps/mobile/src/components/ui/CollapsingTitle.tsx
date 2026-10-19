import { type ReactNode, useState } from 'react';
import { View } from 'react-native';
import {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BAR_HEIGHT, COLLAPSE_DISTANCE, COLLAPSED_SCALE, dockShift } from '@/lib/collapse';
import { cn } from '@/lib/cn';
import { useReducedMotionPref } from '@/motion';
import { AnimatedScrollView, AnimatedText, AnimatedView } from './animated';
import { Text } from './Text';

type CollapsingTitleProps = {
  title: string;
  /** Small CAPS line above the title; it fades out first. */
  overline?: string;
  /** Icon buttons on the right; they move into the bar and stay reachable. */
  actions?: ReactNode;
  /** Content classes, as on Screen (gap, padding). */
  className?: string;
  children: ReactNode;
};

type Box = { top: number; height: number };

/**
 * A tab screen whose large title shrinks into a bar as the list scrolls (micro.header B ·
 * Kiçilib yerləşir). Same safe areas, ground and 16pt gutter as Screen. With less motion
 * the large title only fades and a small one appears in the bar.
 */
export function CollapsingTitle({
  title,
  overline,
  actions,
  className,
  children,
}: CollapsingTitleProps) {
  const reduced = useReducedMotionPref();
  const y = useSharedValue(0);
  // Measured, so the title docks exactly whatever the font scale is; estimates until then.
  const [header, setHeader] = useState(66);
  const [column, setColumn] = useState(16);
  const [titleBox, setTitleBox] = useState<Box>({ top: 16, height: 34 });
  const [actionsBox, setActionsBox] = useState<Box>({ top: 18, height: 48 });
  const titleShift = dockShift(column + titleBox.top, titleBox.height, COLLAPSED_SCALE);
  const actionsShift = dockShift(actionsBox.top, actionsBox.height, 1);

  const onScroll = useAnimatedScrollHandler((e) => {
    y.value = e.contentOffset.y;
  });
  // 0 → 1 over the first 56pt of scrolling.
  const p = useDerivedValue(() =>
    interpolate(y.value, [0, COLLAPSE_DISTANCE], [0, 1], Extrapolation.CLAMP),
  );
  const bar = useAnimatedStyle(() => ({ opacity: p.value }));
  const fadeFirst = useAnimatedStyle(() => ({ opacity: Math.max(0, 1 - p.value * 2.2) }));
  const big = useAnimatedStyle(() =>
    reduced
      ? { opacity: Math.max(0, 1 - p.value * 1.6) }
      : {
          transformOrigin: 'left top',
          transform: [
            { translateY: p.value * titleShift },
            { scale: 1 - p.value * (1 - COLLAPSED_SCALE) },
          ],
        },
  );
  const lift = useAnimatedStyle(() =>
    reduced ? {} : { transform: [{ translateY: p.value * actionsShift }] },
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-page">
      <View className="flex-1">
        <AnimatedScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerClassName="flex-grow"
          keyboardShouldPersistTaps="handled"
        >
          {/* Keeps the room of the large header, which floats above the list. */}
          <View style={{ height: header }} />
          <View className={cn('flex-1 gap-4 px-4 pb-4 pt-4', className)}>{children}</View>
        </AnimatedScrollView>
        <View
          pointerEvents="box-none"
          onLayout={(e) => setHeader(e.nativeEvent.layout.height)}
          className="absolute inset-x-0 top-0"
        >
          <AnimatedView
            pointerEvents="none"
            style={[bar, { height: reduced ? Math.max(header, BAR_HEIGHT) : BAR_HEIGHT }]}
            className="absolute inset-x-0 top-0 justify-center border-b border-border bg-surf px-4"
          >
            {reduced ? (
              <Text numberOfLines={1} className="font-sans-black text-md">
                {title}
              </Text>
            ) : null}
          </AnimatedView>
          <View pointerEvents="box-none" className="flex-row items-end gap-2 px-4 pt-4">
            <View
              pointerEvents="none"
              onLayout={(e) => setColumn(e.nativeEvent.layout.y)}
              className="min-w-0 flex-1 gap-0.5"
            >
              {overline ? (
                <AnimatedView style={reduced ? big : fadeFirst}>
                  <Text variant="overline" tone="muted" className="text-xs">
                    {overline}
                  </Text>
                </AnimatedView>
              ) : null}
              <AnimatedText
                onLayout={(e) =>
                  setTitleBox({ top: e.nativeEvent.layout.y, height: e.nativeEvent.layout.height })
                }
                style={big}
                accessibilityRole="header"
                numberOfLines={1}
                className="font-display-black text-3xl text-ink"
              >
                {title}
              </AnimatedText>
            </View>
            {actions ? (
              <AnimatedView
                onLayout={(e) =>
                  setActionsBox({
                    top: e.nativeEvent.layout.y,
                    height: e.nativeEvent.layout.height,
                  })
                }
                style={lift}
                className="flex-row gap-2"
              >
                {actions}
              </AnimatedView>
            ) : null}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
