import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cn } from '@/lib/cn';

type ScreenProps = {
  children: ReactNode;
  /** Wrap content in a ScrollView. Disable for screens that own a virtualized list. */
  scroll?: boolean;
  className?: string;
};

/** Root container for every screen: safe areas, background, horizontal gutter. */
export function Screen({ children, scroll = true, className }: ScreenProps) {
  const content = <View className={cn('flex-1 gap-6 px-4 py-6', className)}>{children}</View>;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
      {scroll ? (
        <ScrollView contentContainerClassName="flex-grow" keyboardShouldPersistTaps="handled">
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}
