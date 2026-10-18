import type { ReactNode } from 'react';
import { View } from 'react-native';
import { vars } from 'nativewind';
import { themeVars } from '@mytutor/config/tailwind/ari';
import type { ColorSchemeName } from './tokens';
import { useColorSchemeName } from './useColorSchemeName';

const cssVars: Record<ColorSchemeName, ReturnType<typeof vars>> = {
  light: vars(themeVars('light')),
  dark: vars(themeVars('dark')),
};

type ThemeScopeProps = {
  children: ReactNode;
  className?: string;
};

/**
 * A View that carries the arı color variables of the active scheme. The root has one; anything
 * rendered outside it needs its own, e.g. the content of a `Modal`, which the web renders in a
 * portal where the root's CSS variables do not reach.
 */
export function ThemeScope({ children, className }: ThemeScopeProps) {
  const scheme = useColorSchemeName();
  // `vars()` is NativeWind's mechanism for scoping CSS variables; it must go through `style`.
  return (
    <View style={cssVars[scheme]} className={className}>
      {children}
    </View>
  );
}
