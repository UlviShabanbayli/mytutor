import { View } from 'react-native';
import { cn } from '@/lib/cn';
import { Text } from './Text';

type AvatarProps = {
  /** The name's first letter is shown; the name itself is read by screen readers nearby. */
  name: string;
  size?: 'md' | 'lg';
  className?: string;
};

/** Initial on a warm raised circle, until accounts have photos. */
export function Avatar({ name, size = 'md', className }: AvatarProps) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={cn(
        'items-center justify-center rounded-full bg-raised',
        size === 'lg' ? 'h-16 w-16' : 'h-11 w-11',
        className,
      )}
    >
      <Text
        className={cn(
          'font-display-black text-honey-text',
          size === 'lg' ? 'text-2xl' : 'text-base',
        )}
      >
        {name.trim().charAt(0).toLocaleUpperCase('az')}
      </Text>
    </View>
  );
}
