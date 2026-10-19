import { View } from 'react-native';
import { Mascot } from '@/components/mascot/Mascot';
import { type MascotMoment, moments } from '@/components/mascot/moments';
import { Icon, type IconName, Text } from '@/components/ui';
import { iconShapes } from '@/components/ui/iconShapes';
import { GallerySection } from './GallerySection';

/** All mascot moments and the whole icon set. */
export function MascotSection() {
  const names = Object.keys(moments) as MascotMoment[];
  const icons = Object.keys(iconShapes) as IconName[];

  return (
    <>
      <GallerySection title="Mascot moments">
        <View className="flex-row flex-wrap gap-2">
          {names.map((moment) => (
            <View
              key={moment}
              className="w-[31%] items-center gap-1 rounded-xl border border-border bg-surf p-2"
            >
              <Mascot moment={moment} size={88} decorative />
              <Text className="font-sans-bold text-xs">{moment}</Text>
            </View>
          ))}
        </View>
      </GallerySection>
      <GallerySection title="Icons">
        <View className="flex-row flex-wrap gap-2">
          {icons.map((name) => (
            <View
              key={name}
              className="w-[22%] items-center gap-1 rounded-md border border-border bg-surf py-2.5"
            >
              <Icon name={name} size={24} />
              <Text tone="muted" className="text-2xs">
                {name}
              </Text>
            </View>
          ))}
        </View>
      </GallerySection>
    </>
  );
}
