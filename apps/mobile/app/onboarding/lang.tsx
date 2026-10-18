import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Mascot } from '@/components/mascot/Mascot';
import { ChoiceCard } from '@/components/onboarding/ChoiceCard';
import { GreetingBubble } from '@/components/onboarding/GreetingBubble';
import { NoteLine } from '@/components/onboarding/NoteLine';
import { StepScreen } from '@/components/onboarding/StepScreen';
import { Button, Text } from '@/components/ui';
import { useAppStore } from '@/features/app/appStore';
import { APP_LOCALES } from '@/i18n';
import { cn } from '@/lib/cn';

/** Step 1: the language, applied to the whole app the moment it is tapped. */
export default function OnboardingLangScreen() {
  const { t } = useTranslation();
  const locale = useAppStore((s) => s.locale);
  const setLocale = useAppStore((s) => s.setLocale);
  const other = locale === 'az' ? 'ru' : 'az';

  return (
    <StepScreen
      step="lang"
      back={false}
      footer={
        <Button label={t('onboarding.continue')} onPress={() => router.push('/onboarding/role')} />
      }
    >
      <View className="mt-1 flex-row items-end gap-1">
        <Mascot moment="greeting" size={112} decorative />
        <GreetingBubble
          greeting={t('onboarding.lang.greeting')}
          other={t('onboarding.lang.greetingOther')}
          otherLanguage={other}
        />
      </View>
      <View className="gap-1">
        <Text variant="title" className="text-2xl">
          {t('onboarding.lang.title')}
        </Text>
        <Text tone="muted" accessibilityLanguage={other}>
          {t('onboarding.lang.titleOther')}
        </Text>
      </View>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={t('onboarding.lang.title')}
        className="gap-3"
      >
        {APP_LOCALES.map((code) => (
          <ChoiceCard
            key={code}
            title={t(`onboarding.lang.${code}.name`)}
            description={t(`onboarding.lang.${code}.description`)}
            language={code}
            selected={locale === code}
            onPress={() => setLocale(code)}
            tile={(selected) => (
              <Text
                className={cn(
                  'font-display-black text-base uppercase',
                  selected ? 'text-on-honey' : 'text-honey-text',
                )}
              >
                {code}
              </Text>
            )}
          />
        ))}
      </View>
      <NoteLine icon="globe" text={t('onboarding.lang.note')} />
    </StepScreen>
  );
}
