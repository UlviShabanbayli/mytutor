import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { stepPosition } from '@/features/onboarding/steps';
import type { StepKey } from '@/features/onboarding/types';
import { StepMotionContext } from '@/features/transitions/stepMotion';
import { useStepEntrance } from '@/features/transitions/useStepEntrance';
import { cn } from '@/lib/cn';
import { StepHeader } from './StepHeader';

type StepScreenProps = {
  /** Shows the step progress of this screen's track at the top. */
  step?: StepKey;
  back?: boolean;
  /** Replaces the step header (e.g. a lone close button). */
  header?: ReactNode;
  children: ReactNode;
  /** The screen's actions, pinned under the content and above the keyboard. */
  footer?: ReactNode;
  contentClassName?: string;
};

/**
 * Frame of every first-launch and account screen: header, scrolling content, pinned footer.
 * Moving between steps, only the content slides; the frame stays (transitions.onboarding A).
 */
export function StepScreen({
  step,
  back = true,
  header,
  children,
  footer,
  contentClassName,
}: StepScreenProps) {
  const insets = useSafeAreaInsets();
  const position = step ? stepPosition(step) : null;
  const { motion, contentStyle } = useStepEntrance(position?.track, position?.step);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-page">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <StepMotionContext.Provider value={motion}>
          {header ?? (step ? <StepHeader step={step} back={back} /> : null)}
          <View className="flex-1">
            <Animated.View style={[StyleSheet.absoluteFill, contentStyle]}>
              <ScrollView
                className="flex-1"
                contentContainerClassName={cn('flex-grow gap-4 px-4 pb-4 pt-2', contentClassName)}
                keyboardShouldPersistTaps="handled"
              >
                {children}
              </ScrollView>
            </Animated.View>
          </View>
        </StepMotionContext.Provider>
        {footer ? (
          <View
            className="gap-1.5 px-4 pt-3"
            // The home indicator inset is device-specific, so it cannot be a static className.
            style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          >
            {footer}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
