import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AccountNeededPanel } from '@/components/onboarding/AccountNeededPanel';
import { useAuthStore } from '@/features/auth/authStore';
import { isAskReason } from '@/features/auth/types';
import { useLeaveAuth } from '@/features/auth/useLeaveAuth';

/**
 * The "account needed" moment (`/auth/account?reason=join_class`): a guest tried something
 * that needs an account. Reasons: join_class, parent_link, ask, chat, subscribe, save_progress.
 */
export default function AuthAccountScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ reason?: string }>();
  const reason = isAskReason(params.reason) ? params.reason : 'save_progress';
  const startFlow = useAuthStore((s) => s.startFlow);
  const leave = useLeaveAuth();

  const later = () => {
    startFlow(reason);
    leave();
  };

  return (
    <View className="flex-1 justify-end bg-scrim">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.close')}
        onPress={later}
        className="flex-1"
      />
      <AccountNeededPanel
        reason={reason}
        onLater={later}
        onPhone={() => {
          startFlow(reason);
          router.push('/auth/phone');
        }}
      />
    </View>
  );
}
