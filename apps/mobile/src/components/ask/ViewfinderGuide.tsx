import { View } from 'react-native';
import { cn } from '@/lib/cn';

const corner = 'absolute h-[30px] w-[30px] border-honey';

/**
 * Over the camera picture: a dimmed scrim with a clear honey-cornered frame in the upper
 * middle, where one question should fit. Purely visual; the hint below says it in words.
 */
export function ViewfinderGuide() {
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="absolute inset-0"
    >
      <View className="flex-1 bg-scrim" />
      <View className="flex-row">
        <View className="w-5 bg-scrim" />
        <View className="aspect-[9/4] flex-1 rounded-[18px]">
          <View className={cn(corner, 'left-0 top-0 rounded-tl-[18px] border-l-4 border-t-4')} />
          <View className={cn(corner, 'right-0 top-0 rounded-tr-[18px] border-r-4 border-t-4')} />
          <View className={cn(corner, 'bottom-0 left-0 rounded-bl-[18px] border-b-4 border-l-4')} />
          <View
            className={cn(corner, 'bottom-0 right-0 rounded-br-[18px] border-b-4 border-r-4')}
          />
        </View>
        <View className="w-5 bg-scrim" />
      </View>
      <View className="flex-[1.6] bg-scrim" />
    </View>
  );
}
