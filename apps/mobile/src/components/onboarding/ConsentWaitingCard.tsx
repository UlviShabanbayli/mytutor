import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import { formatCountdown } from '@/features/auth/countdown';
import { HexTile } from './HexTile';
import { ResendButton } from './ResendButton';

type ConsentWaitingCardProps = {
  /** The parent's number, masked. */
  maskedPhone: string;
  secondsLeft: number;
  onResend: () => void;
  resending: boolean;
  onChangeNumber: () => void;
};

/** "Waiting for your parent": where the code went, and resend / change the number. */
export function ConsentWaitingCard({
  maskedPhone,
  secondsLeft,
  onResend,
  resending,
  onChangeNumber,
}: ConsentWaitingCardProps) {
  const { t } = useTranslation();

  return (
    <View accessibilityLiveRegion="polite" className="gap-2.5 rounded-xl bg-raised p-3.5">
      <View className="flex-row items-center gap-3">
        <HexTile size={44} fill="honey">
          <Icon name="clock" size={22} color="on-honey" />
        </HexTile>
        <View className="min-w-0 flex-1 gap-0.5">
          <Text className="font-sans-black">{t('onboarding.consent.waitingTitle')}</Text>
          <Text variant="caption" tone="muted" className="font-sans">
            {t('onboarding.consent.waitingBody', { phone: maskedPhone })}
          </Text>
        </View>
      </View>
      <View className="flex-row gap-2">
        <ResendButton
          variant="boxed"
          secondsLeft={secondsLeft}
          waitingLabel={t('onboarding.consent.resendIn', { time: formatCountdown(secondsLeft) })}
          label={t('onboarding.consent.resend')}
          onPress={onResend}
          busy={resending}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.consent.changeNumber')}
          onPress={onChangeNumber}
          className="min-h-[44px] flex-1 items-center justify-center rounded-md border-2 border-border bg-surf px-2 active:opacity-70"
        >
          <Text className="font-sans-bold text-sm">{t('onboarding.consent.changeNumber')}</Text>
        </Pressable>
      </View>
    </View>
  );
}
