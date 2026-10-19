import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, Text } from '@/components/ui';
import { Mascot } from '@/components/mascot/Mascot';
import type { Hive, HiveUnit, UnitTest } from '@/features/learn/types';
import { useLearnText } from '@/features/learn/useLearnText';
import { playCue } from '@/lib/cues';
import { cn } from '@/lib/cn';
import { FlatHex } from './FlatHex';
import { SealedFrame } from './SealedFrame';

type UnitDoneViewProps = {
  hive: Hive;
  unit: HiveUnit;
  next: HiveUnit | undefined;
  result: UnitTest['result'];
};

/** "Çərçivə möhürləndi": the celebration after a unit test is passed. */
export function UnitDoneView({ hive, unit, next, result }: UnitDoneViewProps) {
  const { t } = useLearnText();
  const count = unit.topics.length;
  const toHive = (open?: string) =>
    router.replace({
      pathname: '/subject/[id]',
      params: { id: hive.id, ...(open ? { open } : {}) },
    });

  useEffect(() => playCue('complete'), []);

  return (
    <SafeAreaView className="flex-1 bg-honey">
      <ScrollView contentContainerClassName="flex-grow items-center gap-2.5 px-5 pb-4 pt-2">
        <Text variant="overline" className="text-sm tracking-[1.3px] text-on-honey">
          {t('learn.unitDone.overline', { number: unit.number })}
        </Text>
        <Mascot moment="unitDone" size={150} />
        <Text variant="heading" className="text-center font-display-black text-2xl text-on-honey">
          {t('learn.unitDone.title', { title: unit.title })}
        </Text>
        <Text className="max-w-[320px] text-center text-on-honey">
          {result
            ? t('learn.unitDone.bodyScore', { count, correct: result.correct, total: result.total })
            : t('learn.unitDone.body', { count })}
        </Text>
        <View
          accessible
          accessibilityLabel={t('learn.unitDone.frameAria', { number: unit.number, count })}
          className="mt-1"
        >
          <SealedFrame unit={unit} />
        </View>
        {result ? (
          <View className="mt-1.5 flex-row gap-2.5 self-stretch">
            <View className="flex-[0.8] items-start gap-0.5 rounded-[18px] bg-cap/60 px-3 py-2.5">
              <Text className="font-display-black text-2xl text-on-honey">
                {t('learn.unitDone.points', { points: result.points })}
              </Text>
              <Text className="font-sans-bold text-sm text-on-honey">
                {t('learn.unitDone.pointsLabel')}
              </Text>
            </View>
            {result.badge ? (
              <View className="flex-[1.2] flex-row items-center gap-2.5 rounded-[18px] bg-cap/60 px-3 py-2.5">
                <FlatHex size={44} color="on-honey">
                  <Icon name="medal" size={22} color="honey" />
                </FlatHex>
                <View className="min-w-0 flex-1 gap-0.5">
                  <Text variant="overline" className="text-on-honey">
                    {t('learn.unitDone.badge')}
                  </Text>
                  <Text className="font-sans-black text-base text-on-honey">{result.badge}</Text>
                </View>
              </View>
            ) : null}
          </View>
        ) : null}
        <View className="flex-1" />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('learn.unitDone.continue')}
          onPress={() => toHive()}
          className="self-stretch"
        >
          {({ pressed }) => (
            <View
              className={cn(
                'h-[58px] items-center justify-center rounded-[18px] bg-on-honey',
                pressed && 'opacity-90',
              )}
            >
              <Text className="font-sans-black text-md uppercase tracking-[0.7px] text-honey">
                {t('learn.unitDone.continue')}
              </Text>
            </View>
          )}
        </Pressable>
        {next ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => toHive(next.id)}
            className="min-h-touch justify-center self-stretch"
          >
            <Text className="text-center font-sans-black text-base text-on-honey">
              {t('learn.unitDone.next', { number: next.number, title: next.title })}
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
