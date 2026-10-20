import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { DEMO_ACCOUNTS } from '@mytutor/demo-data';
import { Text } from '@/components/ui';
import { nationalDigits } from '@/features/auth/phone';

type DemoAccountsHintProps = {
  /** Puts the account's number into the phone field (national digits). */
  onPick: (digits: string) => void;
};

/**
 * Development builds only: the demo's accounts, one per role. Tapping one fills its number; with
 * the demo SMS code it signs in to that role and world. Production builds render nothing.
 */
export function DemoAccountsHint({ onPick }: DemoAccountsHintProps) {
  const { t } = useTranslation();
  if (!__DEV__) return null;

  return (
    <View className="gap-1.5 rounded-sm border border-dashed border-info bg-info-bg px-2.5 py-2">
      <Text className="font-sans-bold text-xs" tone="info">
        {t('onboarding.phone.demoAccounts')}
      </Text>
      <View className="flex-row flex-wrap gap-1.5">
        {DEMO_ACCOUNTS.map((account) => (
          <Pressable
            key={account.phone}
            accessibilityRole="button"
            accessibilityLabel={t('onboarding.phone.demoPick', { label: account.label })}
            onPress={() => onPick(nationalDigits(account.phone))}
            className="min-h-[44px] justify-center rounded-full border border-border bg-surf px-3 active:bg-wax"
          >
            <Text className="font-sans-bold text-xs">{account.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
