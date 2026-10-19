import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PopIn } from '@/components/feedback/PopIn';
import { Text } from '@/components/ui';
import { RANK_IDS } from '@/features/me/types';
import { cn } from '@/lib/cn';
import { useReducedMotionPref } from '@/motion';
import { Hex } from './Hex';

type RankLadderProps = {
  /** Index of the new rank. */
  current: number;
  /** When the ladder climbs to the new rank, in ms after the screen opens (feedback.rankup B). */
  climbAt: number;
};

/**
 * The five ranks on the honey screen: passed, the current one (bigger) and the next ones. It opens
 * on the old rank and climbs: the new rank's step takes the current style with a pop. Screen
 * readers hear the new state from the start.
 */
export function RankLadder({ current, climbAt }: RankLadderProps) {
  const { t } = useTranslation();
  const reduced = useReducedMotionPref();
  const [climbed, setClimbed] = useState(reduced || current === 0);

  useEffect(() => {
    if (climbed) return;
    const timer = setTimeout(() => setClimbed(true), climbAt);
    return () => clearTimeout(timer);
  }, [climbed, climbAt]);

  const shown = climbed ? current : current - 1;

  return (
    <View
      accessibilityLabel={t('me.reward.ranksLabel')}
      className="mt-1 flex-row items-end gap-1.5"
    >
      {RANK_IDS.map((id, i) => {
        const name = t(`me.ranks.${id}`);
        const state = i === current ? 'rankCurrent' : i < current ? 'rankDone' : 'rankNext';
        const hex = (
          <Hex
            width={i === shown ? 50 : 36}
            fill={i === shown ? 'on-honey' : i < shown ? 'cap' : 'honey-deep'}
          >
            <Text
              className={cn(
                'font-sans-black',
                i === shown ? 'text-lg text-honey' : 'text-sm text-on-honey',
              )}
            >
              {i + 1}
            </Text>
          </Hex>
        );
        return (
          <View
            key={id}
            accessible
            accessibilityLabel={t(`me.reward.${state}`, { rank: name })}
            className="w-[62px] items-center gap-1"
          >
            {i === current && climbed && !reduced ? (
              <PopIn from={0.8} fade={false}>
                {hex}
              </PopIn>
            ) : (
              hex
            )}
            <Text
              className={cn(
                'text-center text-2xs leading-[13px] text-on-honey',
                i === shown ? 'font-sans-black' : 'font-sans-bold opacity-75',
              )}
            >
              {name}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
