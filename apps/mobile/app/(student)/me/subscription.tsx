import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { InfoNote } from '@/components/me/InfoNote';
import { InfoSheet } from '@/components/me/InfoSheet';
import { PlanTable } from '@/components/me/PlanTable';
import {
  Button,
  ErrorState,
  Icon,
  LoadingState,
  Screen,
  ScreenHeader,
  Text,
} from '@/components/ui';
import { usePlanFeatures } from '@/features/me/queries';

/** "Abunəlik" (architecture P4): the free plan is full learning; Premium is a calm offer. */
export default function SubscriptionScreen() {
  const { t } = useTranslation();
  const plans = usePlanFeatures();
  const [soon, setSoon] = useState(false);

  return (
    <Screen className="gap-2.5">
      <ScreenHeader title={t('me.subscription.title')} />
      <InfoNote icon="check" tone="ok" lead={t('me.subscription.freeLead')} status>
        {t('me.subscription.freeBody')}
      </InfoNote>
      {plans.isPending ? (
        <LoadingState />
      ) : plans.isError ? (
        <ErrorState onRetry={() => void plans.refetch()} />
      ) : (
        <PlanTable features={plans.data} />
      )}
      <View
        accessibilityLabel={t('me.subscription.priceLabel')}
        className="gap-2 rounded-xl bg-spot p-3.5"
      >
        <View className="gap-0.5">
          <Text className="font-display-bold text-md text-on-spot">
            {t('me.subscription.price')}
          </Text>
          <Text className="text-sm text-on-spot opacity-80">
            {t('me.subscription.cancelAnytime')}
          </Text>
        </View>
        <Button label={t('me.subscription.open')} onPress={() => setSoon(true)} />
        <Pressable
          accessibilityRole="button"
          onPress={() => setSoon(true)}
          className="min-h-touch flex-row items-center justify-center gap-1.5 rounded-md border-2 border-spot-line px-3 active:bg-spot-line"
        >
          <Icon name="link" size={18} color="on-spot" />
          <Text className="font-sans-black text-sm text-on-spot">
            {t('me.subscription.parentPay')}
          </Text>
        </Pressable>
      </View>
      <InfoNote icon="users" tone="raised">
        {t('me.subscription.school')}
      </InfoNote>
      <InfoSheet
        visible={soon}
        title={t('me.subscription.soonTitle')}
        paragraphs={[t('me.subscription.soonBody')]}
        onClose={() => setSoon(false)}
      />
    </Screen>
  );
}
