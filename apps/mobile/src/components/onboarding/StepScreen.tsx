import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StepKey } from '@/features/onboarding/types';
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

/** Frame of every first-launch and account screen: header, scrolling content, pinned footer. */
export function StepScreen({
  step,
  back = true,
  header,
  children,
  footer,
  contentClassName,
}: StepScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-page">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        {header ?? (step ? <StepHeader step={step} back={back} /> : null)}
        <ScrollView
          className="flex-1"
          contentContainerClassName={cn('flex-grow gap-4 px-4 pb-4 pt-2', contentClassName)}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
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
