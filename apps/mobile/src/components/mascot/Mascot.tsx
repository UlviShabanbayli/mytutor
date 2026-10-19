import { useId } from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { moodArt, type MascotMood } from './moodArt';
import { moments, type MascotMoment } from './moments';

type MascotProps = (
  { moment: MascotMoment; mood?: never } | { mood: MascotMood; moment?: never }
) & {
  size?: number;
  /** Hide from screen readers when the text next to it says the same thing. */
  decorative?: boolean;
  className?: string;
};

/**
 * Vızı, the bee. Rules from the design: at most one on a screen, never inside a test question,
 * never shaming. Same colors in both schemes (the mascot carries its own light).
 */
export function Mascot({ moment, mood, size = 120, decorative = false, className }: MascotProps) {
  const art = moodArt[mood ?? moments[moment]];
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
