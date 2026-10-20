import { useId } from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { moodArt, type MascotMood } from './moodArt';

type MascotStillProps = {
  mood: MascotMood;
  size: number;
  decorative: boolean;
  className?: string;
};

/** One mood drawing as it is (no motion): what every mascot without a behaviour shows. */
export function MascotStill({ mood, size, decorative, className }: MascotStillProps) {
  const art = moodArt[mood];
  // Clip-path ids must be unique per instance: on the web all SVGs share one document.
  const id = `vizi${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <View
      className={className}
      accessible={!decorative}
      accessibilityRole={decorative ? undefined : 'image'}
      accessibilityLabel={decorative ? undefined : art.label}
      importantForAccessibility={decorative ? 'no-hide-descendants' : 'yes'}
      accessibilityElementsHidden={decorative}
    >
      <SvgXml xml={art.svg.replaceAll('__ID__', id)} width={size} height={size} />
    </View>
  );
}
