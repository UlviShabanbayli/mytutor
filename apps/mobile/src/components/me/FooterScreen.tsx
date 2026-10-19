import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn } from '@/lib/cn';

type FooterScreenProps = {
  header?: ReactNode;
  children: ReactNode;
  /** Fixed at the bottom above the home indicator: the screen's main action. */
  footer: ReactNode;
  contentClassName?: string;
};

/** A stacked screen whose main action stays in reach while the content scrolls (design footers). */
export function FooterScreen({ header, children, footer, contentClassName }: FooterScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-page">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        {header ? <View className="px-4 pt-2">{header}</View> : null}
        <ScrollView
          className="flex-1"
          contentContainerClassName={cn('gap-2.5 px-4 pb-3 pt-1', contentClassName)}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
        <View
          className="gap-1.5 px-4 pt-2"
          // The home indicator inset is device-specific, so it cannot be a static className.
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          {footer}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
