import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Text } from '@/components/ui';
import { mathParts, spokenText, useTestMath } from '@/features/tests/testMath';
import { type ColorName, useThemeColors } from '@/theme';

type MathTextProps = {
  text: string;
  /** The text's size in points: formulas are drawn to match it. */
  fontSize: number;
  className?: string;
  color?: ColorName;
};

/** Text whose formulas ($…$) are drawn from the test's typeset SVGs, in line with the words. */
export function MathText({ text, fontSize, className, color = 'ink' }: MathTextProps) {
  const math = useTestMath();
  const ink = useThemeColors()[color];
  return (
    <Text className={className} accessibilityLabel={spokenText(text)}>
      {mathParts(text).map((part, i) => {
        const svg = part.math ? math[part.text] : undefined;
        if (!part.math) return part.text;
        if (!svg) return part.text;
        // Sizes come from each formula, so they cannot be classes; the formula sits on the
        // baseline and reaches below it by its depth.
        return (
          <View
            key={i}
            style={{
              width: svg.width * fontSize,
              height: svg.height * fontSize,
              transform: [{ translateY: svg.depth * fontSize }],
            }}
          >
            <SvgXml xml={svg.svg} width="100%" height="100%" color={ink} />
          </View>
        );
      })}
    </Text>
  );
}
