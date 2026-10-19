import '../global.css';

import { useFonts } from 'expo-font';
import { QueryClientProvider } from '@tanstack/react-query';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// Importing i18n also initialises it before any screen renders.
import i18n from '@/i18n';
import { ToastHost } from '@/components/ui';
import { useAppHydrated, useAppStore } from '@/features/app/appStore';
import { queryClient } from '@/lib/query-client';
import { useStackMotion } from '@/features/transitions/useStackMotion';
import { MotionConfig } from '@/motion';
import { ThemeProvider } from '@/theme';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Onest without contextual alternates, so "2x" never changes shape (see
  // scripts/strip-font-calt.py), and Unbounded for titles; the names match the font tokens.
  const [fontsLoaded, fontError] = useFonts({
    Onest_400Regular: require('../assets/fonts/Onest_400Regular.ttf'),
    Onest_500Medium: require('../assets/fonts/Onest_500Medium.ttf'),
    Onest_600SemiBold: require('../assets/fonts/Onest_600SemiBold.ttf'),
    Onest_700Bold: require('../assets/fonts/Onest_700Bold.ttf'),
    Onest_800ExtraBold: require('../assets/fonts/Onest_800ExtraBold.ttf'),
    Unbounded_600SemiBold: require('../assets/fonts/Unbounded_600SemiBold.ttf'),
    Unbounded_700Bold: require('../assets/fonts/Unbounded_700Bold.ttf'),
    Unbounded_800ExtraBold: require('../assets/fonts/Unbounded_800ExtraBold.ttf'),
  });
  const hydrated = useAppHydrated();
  const locale = useAppStore((s) => s.locale);
  const ready = (fontsLoaded || fontError !== null) && hydrated;
  const stackMotion = useStackMotion();

  // The interface follows the language chosen on first launch or in settings.
  useEffect(() => {
    if (i18n.language !== locale) void i18n.changeLanguage(locale);
  }, [locale]);

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  // Keep the splash screen until fonts and the stored app state resolve; the system font is
  // used if fonts fail to load.
  if (!ready) return null;

  return (
    <GestureHandlerRootView className="flex-1">
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <MotionConfig />
          <Stack screenOptions={stackMotion} />
          <ToastHost />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
