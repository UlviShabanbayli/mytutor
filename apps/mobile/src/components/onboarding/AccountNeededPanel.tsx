import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Mascot } from '@/components/mascot/Mascot';
import { Button, Text } from '@/components/ui';
import type { AskReason } from '@/features/auth/types';
import { AccountBenefits } from './AccountBenefits';
import { QuietButton } from './QuietButton';

type AccountNeededPanelProps = {
  reason: AskReason;
  onPhone: () => void;
  onLater: () => void;
};

/**
 * The "account needed" moment as a bottom sheet: why an account is needed now, what it gives,
 * "continue with phone" or "later". Guests keep everything they collected.
 */
export function AccountNeededPanel({ reason, onPhone, onLater }: AccountNeededPanelProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const title = t(`onboarding.account.reason.${reason}.title`);

  return (
    <View
      accessibilityViewIsModal
      accessibilityLabel={title}
      className="items-center gap-3 rounded-t-3xl bg-surf px-5 pt-2.5"
      // The home indicator inset is device-specific, so it cannot be a static className.
      style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}
    >
      <View className="h-[5px] w-10 rounded-full bg-border" />
      <Mascot moment="greeting" size={96} decorative />
      <Text variant="heading" className="text-center text-xl">
        {title}
      </Text>
      <Text tone="muted" className="text-center">
        {t(`onboarding.account.reason.${reason}.body`)}
      </Text>
      <AccountBenefits />
      <Button
        label={t('onboarding.account.phone')}
        icon="phone"
        onPress={onPhone}
        className="mt-1 self-stretch"
      />
      <View className="self-stretch">
        <QuietButton label={t('onboarding.account.later')} onPress={onLater} />
      </View>
      <Text variant="caption" tone="muted" className="text-center font-sans">
        {t('onboarding.account.guestNote')}
      </Text>
    </View>
  );
}
