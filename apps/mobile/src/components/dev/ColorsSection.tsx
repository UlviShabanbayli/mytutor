import { View } from 'react-native';
import { Text } from '@/components/ui';
import { type ColorName, useThemeColors } from '@/theme';
import { GallerySection } from './GallerySection';

/** Every palette token of the active scheme with its value. */
export function ColorsSection() {
  const colors = useThemeColors();
  const names = Object.keys(colors) as ColorName[];

  return (
    <GallerySection title="Colors">
      <View className="flex-row flex-wrap gap-2">
        {names.map((name) => (
          <View key={name} className="w-[31%] gap-1">
            {/* Swatch color is the token value itself, so it is set inline. */}
            <View
              className="h-10 rounded-md border border-border"
              style={{ backgroundColor: colors[name] }}
            />
            <Text className="font-sans-bold text-xs">{name}</Text>
            <Text tone="muted" className="text-2xs">
              {colors[name]}
            </Text>
          </View>
        ))}
      </View>
    </GallerySection>
  );
}
