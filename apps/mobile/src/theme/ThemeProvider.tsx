import type { ReactNode } from 'react';
import { View } from 'react-native';
import { vars } from 'nativewind';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import type { Theme } from 'expo-router';
import { themeVars } from '@mytutor/config/tailwind';
import { colors, type ColorSchemeName } from './tokens';
import { useColorSchemeName } from './useColorSchemeName';

const cssVars: Record<ColorSchemeName, ReturnType<typeof vars>> = {
  light: vars(themeVars('light')),
  dark: vars(themeVars('dark')),
};

function navigationTheme(scheme: ColorSchemeName): Theme {
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const c = colors[scheme];
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: c.primary,
      background: c.background,
      card: c.card,
      text: c.foreground,
      border: c.border,
      notification: c.accent,
    },
  };
}

type ThemeProviderProps = {
  children: ReactNode;
};

/** Applies semantic color CSS variables and the matching navigation theme. */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const scheme = useColorSchemeName();

  return (
    <NavigationThemeProvider value={navigationTheme(scheme)}>
      {/* `vars()` is NativeWind's mechanism for scoping CSS variables; it must go through `style`. */}
      <View style={cssVars[scheme]} className="flex-1 bg-background">
        {children}
      </View>
    </NavigationThemeProvider>
  );
}
