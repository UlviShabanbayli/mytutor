import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, type IconName, Text } from '@/components/ui';

const BENEFITS: { key: 'progress' | 'class' | 'parent'; icon: IconName }[] = [
  { key: 'progress', icon: 'shield' },
  { key: 'class', icon: 'users' },
  { key: 'parent', icon: 'eye' },
];

/** What an account gives: kept progress, classes, a parent who sees only what is allowed. */
export function AccountBenefits() {
  const { t } = useTranslation();

  return (
    <View className="gap-2.5 self-stretch">
      {BENEFITS.map(({ key, icon }) => (
        <View key={key} className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-md bg-raised">
            <Icon name={icon} size={22} color="honey-text" />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="font-sans-black">{t(`onboarding.account.benefits.${key}.title`)}</Text>
            <Text variant="caption" tone="muted" className="font-sans">
              {t(`onboarding.account.benefits.${key}.body`)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
