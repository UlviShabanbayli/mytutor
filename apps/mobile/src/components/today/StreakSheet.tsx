import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, ErrorState, Icon, LoadingState, Sheet, Text } from '@/components/ui';
import { Mascot } from '@/components/mascot/Mascot';
import { leaveToToday } from '@/features/today/hooks';
import { useMotivationData } from '@/features/today/queries';

/**
 * The streak stopped: praise what was done, offer a short restart and explain the hive guard
 * (streak freeze). Nothing is taken away (no hearts, no lives). Vızı droops and sighs
 * (vizi.streak A); "restart" lets it spring back up before the sheet closes.
 */
export function StreakSheet() {
  const { t } = useTranslation();
  const motivation = useMotivationData();
  const data = motivation.data;
  const [restarting, setRestarting] = useState(false);

  return (
    <Sheet visible onClose={leaveToToday} title={t('today.streak.title')} showTitle={false}>
      {motivation.isPending ? (
        <LoadingState />
      ) : !data ? (
        <ErrorState onRetry={() => void motivation.refetch()} />
      ) : (
        <View className="items-center gap-3 px-1 pb-2">
          <Mascot
            moment="streakBroken"
            behavior="streak"
            recovered={restarting}
            onDone={leaveToToday}
            size={128}
            decorative
          />
          <Text variant="heading" className="text-center font-display-black text-xl">
            {t('today.streak.title')}
          </Text>
          <Text tone="muted" className="text-center">
            {t('today.streak.body', { count: data.endedStreak, minutes: data.restartMinutes })}
          </Text>
          <View className="flex-row items-center gap-2.5 self-stretch rounded-lg bg-raised px-3 py-2.5">
            <Icon name="shield" size={24} color="honey-text" />
            <Text className="min-w-0 flex-1 text-sm">
              <Text className="font-sans-black text-sm">{t('today.streak.freezeTitle')}</Text>{' '}
              {t('today.streak.freezeBody', { count: data.freezesThisWeek })}
            </Text>
          </View>
          <Button
            label={t('today.streak.restart')}
            onPress={() => setRestarting(true)}
            className="self-stretch"
          />
        </View>
      )}
    </Sheet>
  );
}
