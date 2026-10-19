import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { DEMO_CODE } from '@/features/auth/verifier';

/**
 * Development builds only: the demo verifier's code, since no SMS is sent. Production builds
 * render nothing, so the code never reaches students.
 */
export function DevCodeHint() {
  const { t } = useTranslation();
  if (!__DEV__) return null;

  return (
    <View className="self-start rounded-sm border border-dashed border-info bg-info-bg px-2.5 py-1.5">
      <Text className="font-sans-bold text-xs" tone="info">
        {t('onboarding.otp.devHint', { code: DEMO_CODE })}
      </Text>
    </View>
  );
}
