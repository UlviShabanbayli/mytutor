import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type StepLayoutProps = {
  children: ReactNode;
  /** The step's actions under the content; replaced by a sheet when one is open. */
  footer?: ReactNode;
  /** A bottom sheet (result of a check) shown instead of the footer. */
  sheet?: ReactNode;
};

/** Scrolling step content with its actions pinned under it, above the home indicator. */
export function StepLayout({ children, footer, sheet }: StepLayoutProps) {
  const insets = useSafeAreaInsets();
  return (
    <>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="gap-3 px-4 pb-4 pt-1"
      >
        {children}
      </ScrollView>
      {sheet ?? (
        // The home indicator inset is device-specific, so it cannot be a static class.
        <View
          className="gap-3 px-4 pt-2.5"
          style={{ paddingBottom: Math.max(insets.bottom, 12) + 8 }}
        >
          {footer}
        </View>
      )}
    </>
  );
}
