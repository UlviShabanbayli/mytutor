import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { usePullRefresh } from '@/features/transitions/usePullRefresh';
import { useReducedMotionPref } from '@/motion';
import { RefreshVizi } from './RefreshVizi';

type PullScrollProps = {
  /** Reloads the screen's data; the pull holds until it settles. */
  onRefresh: () => Promise<unknown>;
  contentContainerClassName?: string;
  children: ReactNode;
};

/**
 * A screen's scroll view that refreshes when pulled down at its top, with Vızı flying in
 * above the list (transitions.refresh B). Screen readers get a "Yenilə" action instead.
 */
export function PullScroll({ onRefresh, contentContainerClassName, children }: PullScrollProps) {
  const { t } = useTranslation();
  const reduced = useReducedMotionPref();
  const { scrollY, pull, hover, leave, gesture, refreshNow } = usePullRefresh(onRefresh, reduced);
  const contentStyle = useAnimatedStyle(() => ({ transform: [{ translateY: pull.get() }] }));

  return (
    <View className="flex-1">
      {/* On the web the browser keeps scrolling vertically; the pull is a phone gesture. */}
      <GestureDetector gesture={gesture} touchAction="pan-y">
        <ScrollView
          contentContainerClassName={contentContainerClassName}
          keyboardShouldPersistTaps="handled"
          // The pull replaces the top bounce, so the list does not move twice.
          bounces={false}
          overScrollMode="never"
          scrollEventThrottle={16}
          onScroll={(e) => scrollY.set(e.nativeEvent.contentOffset.y)}
          accessibilityActions={[{ name: 'refresh', label: t('common.refresh') }]}
          onAccessibilityAction={(e) => {
            if (e.nativeEvent.actionName === 'refresh') refreshNow();
          }}
        >
          <Animated.View style={contentStyle}>{children}</Animated.View>
        </ScrollView>
      </GestureDetector>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <RefreshVizi pull={pull} hover={hover} leave={leave} reduced={reduced} />
      </View>
    </View>
  );
}
