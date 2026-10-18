import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Mascot } from '@/components/mascot/Mascot';
import { Icon, Text } from '@/components/ui';
import { formatNumber } from '@/features/me/format';
import { RANK_IDS, type RankId } from '@/features/me/types';
import { playCue } from '@/lib/cues';
import { cn } from '@/lib/cn';
import { Hex } from './Hex';

// Decorative honeycomb confetti: [left %, top %, width] (positions are data-driven).
const CONFETTI = [
  [5, 8, 22],
  [85, 11, 16],
  [15, 24, 12],
  [77, 25, 26],
  [6, 39, 18],
  [90, 36, 12],
  [28, 14, 10],
  [67, 7, 12],
  [89, 71, 20],
  [4, 72, 14],
  [72, 18, 9],
  [23, 5, 14],
] as const;

type RewardViewProps = { rank: RankId; points: number; shields: number; badgeName: string };

/** The "new rank" moment: honey screen, Vızı surprised, the ladder and what came with it. */
export function RewardView({ rank, points, shields, badgeName }: RewardViewProps) {
  const { t } = useTranslation();
  const current = RANK_IDS.indexOf(rank);

  useEffect(() => playCue('levelUp'), []);

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-honey">
      <View className="absolute inset-0" importantForAccessibility="no-hide-descendants">
        {CONFETTI.map(([left, top, w], i) => (
          <View
            key={i}
            className={cn('absolute', i % 3 === 1 ? 'opacity-90' : 'opacity-60')}
            // Scattered positions and turns are decoration data, not layout.
            style={{
              left: `${left}%`,
              top: `${top}%`,
              transform: [{ rotate: `${((i * 17) % 40) - 20}deg` }],
            }}
          >
            <Hex width={w} fill={i % 2 ? 'cap' : 'honey-deep'} />
          </View>
        ))}
      </View>
      <View className="flex-1 items-center gap-3 px-6 pb-4 pt-8">
        <Text variant="overline" className="text-sm tracking-[1.3px] text-on-honey">
          {t('me.reward.overline')}
        </Text>
        <Mascot moment="reward" size={180} />
        <Text variant="title" className="text-center text-3xl text-on-honey">
          {t('me.reward.title', { rank: t(`me.ranks.${rank}`) })}
        </Text>
        <Text className="max-w-[310px] text-center text-md leading-6 text-on-honey">
          {t('me.reward.body', { points: formatNumber(points) })}
        </Text>
        <View
          accessibilityLabel={t('me.reward.ranksLabel')}
          className="mt-1 flex-row items-end gap-1.5"
        >
          {RANK_IDS.map((id, i) => {
            const name = t(`me.ranks.${id}`);
            const state = i === current ? 'rankCurrent' : i < current ? 'rankDone' : 'rankNext';
            return (
              <View
                key={id}
                accessible
                accessibilityLabel={t(`me.reward.${state}`, { rank: name })}
                className="w-[62px] items-center gap-1"
              >
                <Hex
                  width={i === current ? 50 : 36}
                  fill={i === current ? 'on-honey' : i < current ? 'cap' : 'honey-deep'}
                >
                  <Text
                    className={cn(
                      'font-sans-black',
                      i === current ? 'text-lg text-honey' : 'text-sm text-on-honey',
                    )}
                  >
                    {i + 1}
                  </Text>
                </Hex>
                <Text
                  className={cn(
                    'text-center text-2xs leading-[13px] text-on-honey',
                    i === current ? 'font-sans-black' : 'font-sans-bold opacity-75',
                  )}
                >
                  {name}
                </Text>
              </View>
            );
          })}
        </View>
        <View className="mt-1 w-full flex-row gap-2.5">
          <View
            accessible
            className="flex-1 flex-row items-center gap-2 rounded-[18px] bg-cap px-3 py-2.5"
          >
            <Icon name="shield" size={22} color="on-honey" />
            <View>
              <Text className="font-sans-black text-base text-on-honey">
                {t('me.reward.shields', { count: shields })}
              </Text>
              <Text className="font-sans-bold text-xs text-on-honey">
                {t('me.reward.shieldsLabel')}
              </Text>
            </View>
          </View>
          <View
            accessible
            className="flex-1 flex-row items-center gap-2 rounded-[18px] bg-cap px-3 py-2.5"
          >
            <Icon name="medal" size={22} color="on-honey" />
            <View className="flex-1">
              <Text className="font-sans-black text-base text-on-honey">
                {t('me.reward.newBadge')}
              </Text>
              <Text className="font-sans-bold text-xs text-on-honey">{badgeName}</Text>
            </View>
          </View>
        </View>
        <View className="flex-1" />
        <Pressable
          accessibilityRole="button"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/me'))}
          className="h-[58px] w-full items-center justify-center rounded-[18px] bg-on-honey active:opacity-90"
        >
          <Text className="font-sans-black text-md tracking-[0.7px] text-honey">
            {t('me.reward.continue')}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/me/badges')}
          className="min-h-11 justify-center px-3"
        >
          <Text className="font-sans-black text-base text-on-honey">{t('me.reward.badges')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
