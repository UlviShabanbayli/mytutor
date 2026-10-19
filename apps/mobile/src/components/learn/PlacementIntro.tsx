import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Icon, Text } from '@/components/ui';
import { Mascot } from '@/components/mascot/Mascot';
import { allTopics } from '@/features/learn/mastery';
import type { ColorName } from '@/theme';
import type { Hive } from '@/features/learn/types';
import { useLearnText } from '@/features/learn/useLearnText';
import { CenterHeader } from './CenterHeader';
import { FlatHex } from './FlatHex';
import { RadioCard } from './RadioCard';

type PlacementIntroProps = {
  hive: Hive;
  range: { min: number; max: number };
  onCheck: () => void;
  onZero: () => void;
};

const POINTS: [ColorName, 'pointUp' | 'pointDown' | 'pointEnd'][] = [
  ['honey', 'pointUp'],
  ['nectar', 'pointDown'],
  ['sealed', 'pointEnd'],
];

/** "Haradan başlayaq?": the adaptive check ("Bilirəm, yoxla") or the first cell. */
export function PlacementIntro({ hive, range, onCheck, onZero }: PlacementIntroProps) {
  const { t, hiveName, bookName } = useLearnText();
  const [choice, setChoice] = useState<'check' | 'zero'>('check');
  const first = allTopics(hive)[0];
  const meta = t('learn.placement.checkMeta', { ...range, minutes: Math.ceil(range.max / 2) });
  const zeroBody = t('learn.placement.zeroBody', {
    number: first?.number ?? '',
    title: first?.title ?? '',
  });

  return (
    <SafeAreaView className="flex-1 bg-page">
      <CenterHeader
        title={t('learn.placement.header', { name: hiveName(hive), book: bookName(hive) })}
        backLabel={t('common.back')}
        onBack={router.back}
      />
      <ScrollView contentContainerClassName="flex-grow gap-3 px-4 pb-4">
        <View className="items-center gap-1">
          <Mascot moment="weakSpot" size={124} />
          <View className="h-[26px] flex-row items-center gap-1.5 rounded-full bg-raised px-2.5">
            <Icon name="target" size={14} color="honey-text" />
            <Text className="font-sans-black text-xs" tone="honey">
              {t('learn.placement.badge')}
            </Text>
          </View>
          <Text variant="heading" className="mt-1.5 text-center font-display-black text-2xl">
            {t('learn.placement.title')}
          </Text>
          <Text tone="muted" className="text-center">
            {t('learn.placement.body')}
          </Text>
        </View>
        <View
          accessibilityRole="radiogroup"
          accessibilityLabel={t('learn.placement.group')}
          className="gap-2.5"
        >
          <RadioCard
            selected={choice === 'check'}
            onPress={() => setChoice('check')}
            accessibilityLabel={`${t('learn.placement.check')}, ${meta}`}
          >
            <View className="gap-2.5">
              <View className="flex-row items-center gap-3">
                <FlatHex size={44} color="honey">
                  <Icon name="target" size={22} color="on-honey" />
                </FlatHex>
                <View className="min-w-0 flex-1 gap-0.5">
                  <Text variant="subheading">{t('learn.placement.check')}</Text>
                  <Text className="font-sans-bold text-sm" tone="honey">
                    {meta}
                  </Text>
                </View>
              </View>
              {POINTS.map(([color, key]) => (
                <View key={key} className="flex-row items-start gap-2">
                  <FlatHex size={10} color={color} className="mt-1" />
                  <Text className="flex-1 text-sm">{t(`learn.placement.${key}`)}</Text>
                </View>
              ))}
            </View>
          </RadioCard>
          <RadioCard
            selected={choice === 'zero'}
            onPress={() => setChoice('zero')}
            accessibilityLabel={`${t('learn.placement.zero')}. ${zeroBody}`}
          >
            <View className="flex-row items-center gap-3">
              <FlatHex size={44} color="wax">
                <Text className="font-sans-black text-xs" tone="lock">
                  {first?.number}
                </Text>
              </FlatHex>
              <View className="min-w-0 flex-1 gap-0.5">
                <Text variant="subheading">{t('learn.placement.zero')}</Text>
                <Text className="text-sm" tone="muted">
                  {zeroBody}
                </Text>
              </View>
            </View>
          </RadioCard>
        </View>
        <View className="flex-1" />
        <Text variant="caption" tone="muted" className="text-center font-sans">
          {t('learn.placement.noLoss')}
        </Text>
        <Button
          label={t(choice === 'check' ? 'learn.placement.start' : 'learn.placement.startZero')}
          onPress={choice === 'check' ? onCheck : onZero}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
