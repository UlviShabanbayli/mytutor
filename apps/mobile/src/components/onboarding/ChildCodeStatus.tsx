import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import type { LinkedChild } from '@/features/onboarding/types';
import { HexTile } from './HexTile';

type ChildCodeStatusProps = {
  state: 'checking' | 'found' | 'not_found' | 'error';
  child?: LinkedChild | null;
};

/** The result of a typed child code: checking, found (whose it is), not found, or an error. */
export function ChildCodeStatus({ state, child }: ChildCodeStatusProps) {
  const { t } = useTranslation();

  if (state === 'checking') {
    return (
      <View accessibilityLiveRegion="polite" className="rounded-lg bg-wax px-3.5 py-3">
        <Text variant="caption" tone="muted">
          {t('onboarding.parentStart.checking')}
        </Text>
      </View>
    );
  }

  if (state === 'found' && child) {
    return (
      <View
        accessibilityLiveRegion="polite"
        className="flex-row items-center gap-3 rounded-lg bg-ok-bg px-3.5 py-3"
      >
        <HexTile size={44} fill="surf">
          <Text className="font-sans-black" tone="ok">
            {child.name.slice(0, 1)}
          </Text>
        </HexTile>
        <View className="min-w-0 flex-1 gap-0.5">
          <View className="flex-row items-center gap-1.5">
            <Icon name="check" size={16} color="ok" />
            <Text className="font-sans-black">{t('onboarding.parentStart.found')}</Text>
          </View>
          <Text variant="caption" className="font-sans text-ink">
            {t('onboarding.parentStart.child', {
              name: child.name,
              grade: t('common.grade', { count: child.grade, ordinal: true }),
            })}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      accessibilityRole="alert"
      className="flex-row items-start gap-2.5 rounded-lg bg-err-bg px-3.5 py-3"
    >
      <Icon name="warning" size={20} color="err" />
      <View className="min-w-0 flex-1 gap-0.5">
        {state === 'not_found' ? (
          <Text className="font-sans-black">{t('onboarding.parentStart.notFoundTitle')}</Text>
        ) : null}
        <Text variant="caption" tone="muted" className="font-sans">
          {state === 'not_found'
            ? t('onboarding.parentStart.notFoundBody')
            : t('onboarding.parentStart.errorBody')}
        </Text>
      </View>
    </View>
  );
}
