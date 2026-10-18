import '../global.css';
import '@/i18n';

import { useFonts } from 'expo-font';
import { QueryClientProvider } from '@tanstack/react-query';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { queryClient } from '@/lib/query-client';
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
  const ready = fontsLoaded || fontError !== null;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  // Keep the splash screen until fonts resolve; system font is used if loading fails.
  if (!ready) return null;

  return (
    <GestureHandlerRootView className="flex-1">
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="test/[id]/index" options={{ gestureEnabled: false }} />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
