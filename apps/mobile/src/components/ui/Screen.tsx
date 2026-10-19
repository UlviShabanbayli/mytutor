import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cn } from '@/lib/cn';
import { PullScroll } from './PullScroll';

type ScreenProps = {
  children: ReactNode;
  /** Wrap content in a ScrollView. Disable for screens that own a virtualized list. */
  scroll?: boolean;
  /** Pull down at the top to reload (transitions.refresh B); the pull waits for it. */
  onRefresh?: () => Promise<unknown>;
  className?: string;
};

/** Root container for every screen: safe areas, page ground, 16pt gutter. */
export function Screen({ children, scroll = true, onRefresh, className }: ScreenProps) {
  const content = <View className={cn('flex-1 gap-4 px-4 py-4', className)}>{children}</View>;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-page">
      {onRefresh ? (
        <PullScroll onRefresh={onRefresh} contentContainerClassName="flex-grow">
          {content}
        </PullScroll>
      ) : scroll ? (
        <ScrollView contentContainerClassName="flex-grow" keyboardShouldPersistTaps="handled">
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}
