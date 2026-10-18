import type { ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import type { Theme } from 'expo-router';
import { colors, type ColorSchemeName } from './tokens';
import { ThemeScope } from './ThemeScope';
import { useColorSchemeName } from './useColorSchemeName';

function navigationTheme(scheme: ColorSchemeName): Theme {
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const c = colors[scheme];
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: c.honey,
      background: c.page,
      card: c.surf,
      text: c.ink,
      border: c.border,
      notification: c.err,
    },
  };
}

type ThemeProviderProps = {
  children: ReactNode;
};

/** Applies the arı color CSS variables, the matching navigation theme and status bar. */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const scheme = useColorSchemeName();

  return (
    <NavigationThemeProvider value={navigationTheme(scheme)}>
      <ThemeScope className="flex-1 bg-page">
        {/* Follows the app's scheme, which the student may set apart from the system. */}
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        {children}
      </ThemeScope>
    </NavigationThemeProvider>
  );
}
