import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';

type SearchSectionProps = { title: string; action?: ReactNode; children: ReactNode };

/** A group of search results under a CAPS title ("MÖVZULAR · 1"). */
export function SearchSection({ title, action, children }: SearchSectionProps) {
  return (
    <View accessibilityLabel={title} className="gap-1.5">
      <View className="flex-row items-center justify-between">
        <Text variant="overline" tone="muted" className="text-xs">
          {title}
        </Text>
        {action}
      </View>
      {children}
    </View>
  );
}
