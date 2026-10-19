import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Icon, StatusPill, Text } from '@/components/ui';
import { SpotOutlineButton } from './SpotOutlineButton';

type SendFooterProps = {
  online: boolean;
  /** Free photo questions left today. */
  left: number;
  used: number;
  sending: boolean;
  failed: boolean;
  onSend: () => void;
};

/** The send button with what sending means today: the n-th free question, a queue, or the limit. */
export function SendFooter({ online, left, used, sending, failed, onSend }: SendFooterProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const locked = left === 0;

  return (
    <View
      className="gap-2 border-t border-border bg-page px-4 pt-2.5"
      // The home indicator inset is device-specific, so it cannot be a static className.
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      {locked ? (
        <View className="gap-2 rounded-xl bg-spot p-3.5">
          <StatusPill kind="premium" label={t('ask.home.premium')} />
          <Text className="font-sans-black text-on-spot">{t('ask.send.limitTitle')}</Text>
          <Text variant="caption" className="font-sans text-on-spot/85">
            {t('ask.send.limitBody')}
          </Text>
          <SpotOutlineButton
            label={t('ask.send.limitPremium')}
            icon="info"
            variant="link"
            onPress={() => router.push('/me/subscription')}
          />
        </View>
      ) : failed ? (
        <View accessibilityRole="alert" className="flex-row items-center justify-center gap-1.5">
          <Icon name="warning" size={16} color="err" />
          <Text variant="caption" tone="err">
            {t('ask.send.error')}
          </Text>
        </View>
      ) : (
        <Text variant="caption" tone="muted" className="text-center font-sans">
          {online
            ? t('ask.send.nthFree', { count: used + 1, ordinal: true })
            : t('ask.send.offline')}
        </Text>
      )}
      <Button
        label={t('ask.send.submit')}
        icon="send"
        loading={sending}
        disabled={locked}
        onPress={onSend}
      />
    </View>
  );
}
