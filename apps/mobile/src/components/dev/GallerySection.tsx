import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';

type GallerySectionProps = {
  title: string;
  children: ReactNode;
};

/** One block of the developer design-system gallery. */
export function GallerySection({ title, children }: GallerySectionProps) {
  return (
    <View className="gap-3">
      <Text variant="overline" tone="muted">
        {title}
      </Text>
      {children}
    </View>
  );
}
