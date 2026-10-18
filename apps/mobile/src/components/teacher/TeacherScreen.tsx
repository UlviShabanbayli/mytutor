import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn } from '@/lib/cn';

type TeacherScreenProps = {
  header: ReactNode;
  children: ReactNode;
  /** A bar under the scroll (main actions); it carries the home-indicator inset. */
  footer?: ReactNode;
  /** `bar` draws the hairline and page ground of the design's footers. */
  footerStyle?: 'plain' | 'bar' | 'sheet';
  scroll?: boolean;
  contentClassName?: string;
};

/** Teacher screens: safe areas, a fixed header, scrolling content and an optional footer. */
export function TeacherScreen({
  header,
  children,
  footer,
  footerStyle = 'plain',
  scroll = true,
  contentClassName,
}: TeacherScreenProps) {
  const insets = useSafeAreaInsets();
  const content = (
    <View className={cn('flex-1 gap-3 px-4 pb-4 pt-1', contentClassName)}>{children}</View>
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-page">
      {header}
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow"
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
      {footer ? (
        <View
          className={cn(
            'gap-2.5 px-4 pt-2.5',
            footerStyle === 'bar' && 'border-t border-border bg-page',
            footerStyle === 'sheet' && 'rounded-t-2xl border-t border-border bg-surf pt-3',
          )}
          // The home indicator inset is device-specific, so it cannot be a static className.
          style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}
        >
          {footer}
        </View>
      ) : null}
    </SafeAreaView>
  );
}
