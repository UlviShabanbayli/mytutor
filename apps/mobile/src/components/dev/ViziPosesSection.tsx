import { View } from 'react-native';
import { MascotStill } from '@/components/mascot/MascotStill';
import { RigPose } from '@/components/mascot/RigPose';
import { moodArt, type MascotMood } from '@/components/mascot/moodArt';
import { Text } from '@/components/ui';
import { GallerySection } from './GallerySection';

const MOODS = Object.keys(moodArt) as MascotMood[];

/** Each mood drawing next to the rig in the same pose: the rig must look the same. */
export function ViziPosesSection() {
  return (
    <GallerySection title="Vızı rig · drawing | rig">
      <View className="flex-row flex-wrap gap-2">
        {MOODS.map((mood) => (
          <View
            key={mood}
            className="w-[48%] items-center gap-1 rounded-xl border border-border bg-surf p-2"
          >
            <View className="flex-row gap-3">
              <MascotStill mood={mood} size={64} decorative />
              <RigPose mood={mood} size={64} />
            </View>
            <Text className="font-sans-bold text-xs">{mood}</Text>
          </View>
        ))}
      </View>
    </GallerySection>
  );
}
