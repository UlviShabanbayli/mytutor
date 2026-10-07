import '../global.css';
import '@/i18n';

import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_900Black,
  useFonts,
} from '@expo-google-fonts/nunito';
import { QueryClientProvider } from '@tanstack/react-query';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { queryClient } from '@/lib/query-client';
import { ThemeProvider } from '@/theme';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_900Black,
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
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="test/[id]/index" options={{ gestureEnabled: false }} />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
