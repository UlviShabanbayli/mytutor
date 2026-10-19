import { useEffect } from 'react';
import { router } from 'expo-router';
import { SplashView } from '@/components/onboarding/SplashView';

/** How long the brand screen stays before the language question. */
const SPLASH_MS = 1600;

/** First launch: the brand splash, then the language question. */
export default function OnboardingSplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => router.replace('/onboarding/lang'), SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  return <SplashView />;
}
