import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Mascot } from '@/components/mascot/Mascot';
import { Text } from '@/components/ui';
import { GLINT } from './glint';
import { HexTile } from './HexTile';
import { SplashDots } from './SplashDots';

// Loose honeycomb glints around the edges, placed as in the design.
const GLINTS = [
  { size: 120, className: 'left-[-28px] top-[70px]' },
  { size: 44, className: 'left-[62px] top-[150px]' },
  { size: 64, className: 'right-[34px] top-[96px]' },
  { size: 150, className: 'bottom-[120px] right-[-40px]' },
  { size: 36, className: 'bottom-[210px] left-[30px]' },
];

/** The brand screen of the first launch: honey ground, Vızı, the "arı" wordmark, the motto. */
export function SplashView() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center overflow-hidden bg-honey px-8">
      {/* The ground is honey in both schemes, so the status bar text stays dark. */}
      <StatusBar style="dark" />
      {GLINTS.map((glint) => (
        <View
          key={glint.className}
          className={`absolute ${glint.className}`}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <HexTile size={glint.size} fill="honey" rawFill={GLINT} />
        </View>
      ))}
      <View className="items-center gap-1.5">
        <Mascot mood="hero" size={180} decorative />
        <Text className="font-display-black text-[112px] leading-[112px] tracking-[-4px] text-on-honey">
          {t('common.appName')}
        </Text>
        <Text className="mt-2.5 max-w-[260px] text-center font-sans-bold text-md text-on-honey">
          {t('onboarding.splash.tagline')}
        </Text>
      </View>
      <View className="absolute bottom-16 left-0 right-0">
        <SplashDots accessibilityLabel={t('onboarding.splash.loading')} />
      </View>
    </View>
  );
}
