import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

type LiveFrameProps = {
  /** Box of the frame (the mascot's size unless a scene needs more room). */
  width: number;
  height: number;
  label: string;
  decorative: boolean;
  className?: string;
  /** Makes Vızı tappable (tap reactions, waking up). */
  onPress?: () => void;
  onPressIn?: () => void;
  children: ReactNode;
};

/**
 * The box a live mascot sits in, with the same accessibility as the still one: an image with
 * the mood's label, or hidden when the text beside it says the same. Tappable mascots are
 * buttons ("Vızıya toxun"); the parts may move outside the box (overflow stays visible).
 */
export function LiveFrame(props: LiveFrameProps) {
  const { width, height, label, decorative, className, onPress, onPressIn, children } = props;
  const { t } = useTranslation();
  const box = { width, height };
  const hidden = {
    importantForAccessibility: decorative ? ('no-hide-descendants' as const) : ('yes' as const),
    accessibilityElementsHidden: decorative,
  };

  if (onPress)
    return (
      <Pressable
        {...hidden}
        accessible={!decorative}
        accessibilityRole="button"
        accessibilityLabel={t('mascot.tap')}
        onPress={onPress}
        onPressIn={onPressIn}
        className={className}
        style={box}
      >
        {children}
      </Pressable>
    );

  return (
    <View
      {...hidden}
      accessible={!decorative}
      accessibilityRole={decorative ? undefined : 'image'}
      accessibilityLabel={decorative ? undefined : label}
      className={className}
      style={box}
    >
      {children}
    </View>
  );
}
