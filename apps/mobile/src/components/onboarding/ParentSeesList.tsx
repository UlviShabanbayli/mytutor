import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';

const ITEMS = [
  { key: 'progress', visible: true },
  { key: 'assignments', visible: true },
  { key: 'chats', visible: false },
] as const;

/** What a parent will and will not see (architecture: "Kim nəyi görür"). */
export function ParentSeesList() {
  const { t } = useTranslation();

  return (
    <View className="gap-2 rounded-xl border border-border bg-surf px-3.5 py-3">
      <Text variant="overline" tone="muted" className="text-xs">
        {t('onboarding.consent.seesTitle')}
      </Text>
      {ITEMS.map(({ key, visible }) => (
        <View key={key} className="flex-row items-center gap-2">
          <Icon name={visible ? 'check' : 'x'} size={18} color={visible ? 'ok' : 'muted'} />
          <Text className="flex-1 font-sans-semibold text-sm" tone={visible ? 'default' : 'muted'}>
            {t(`onboarding.consent.sees.${key}`)}
          </Text>
        </View>
      ))}
    </View>
  );
}
