import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { HexTile } from './HexTile';
import { GLINT } from './glint';

type SplashDotsProps = {
  accessibilityLabel: string;
};

/** Three small hexagons filling one after another while the app gets ready. */
export function SplashDots({ accessibilityLabel }: SplashDotsProps) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % 3), 380);
    return () => clearInterval(timer);
  }, [reduceMotion]);

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      className="flex-row justify-center gap-2"
    >
      {[0, 1, 2].map((i) => (
        <HexTile key={i} size={14} fill="on-honey" rawFill={i === active ? undefined : GLINT} />
      ))}
    </View>
  );
}
