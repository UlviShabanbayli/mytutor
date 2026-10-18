import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import {
  decodeMatch,
  encodeMatch,
  leftOf,
  pairNumber,
  pairedCount,
  pick,
  type MatchSide,
  type MatchState,
} from '@/features/study/matching';
import type { MatchStep } from '@/features/study/types';
import { playCue } from '@/lib/cues';
import { MatchItemButton } from './MatchItemButton';

type MatchQuestionProps = {
  step: MatchStep;
  answer: string | undefined;
  checked: boolean;
  onChange: (answer: string) => void;
};

/** Two columns: tap a formula, then its expansion; tapping a pair splits it. */
export function MatchQuestion({ step, answer, checked, onChange }: MatchQuestionProps) {
  const { t } = useTranslation();
  const [state, setState] = useState<MatchState>(() => ({
    pairs: decodeMatch(answer, step.left.length),
    picked: null,
  }));
  const done = pairedCount(state.pairs);
  const nextFree =
    step.left[state.picked?.side === 'left' ? state.picked.index : state.pairs.indexOf(null)];

  const onPick = (side: MatchSide, index: number) => {
    playCue('tap');
    const next = pick(state, side, index);
    setState(next);
    onChange(encodeMatch(next.pairs));
  };
  const label = (text: string, pair: number, picked: boolean) =>
    pair > 0
      ? t('study.test.matchPaired', { text, n: pair })
      : picked
        ? t('study.test.matchPicked', { text })
        : t('study.test.matchFree', { text });

  return (
    <View className="gap-2.5">
      <Text variant="caption" tone="muted">
        {t('study.test.matchHelp')}
      </Text>
      <View className="flex-row gap-2.5 pt-1">
        <View accessibilityLabel={t('study.test.matchLeft')} className="flex-[2] gap-2.5">
          {step.left.map((text, i) => {
            const pair = pairNumber(state.pairs, i);
            const picked = state.picked?.side === 'left' && state.picked.index === i;
            return (
              <MatchItemButton
                key={text}
                text={text}
                pair={pair}
                picked={picked}
                verdict={checked ? (state.pairs[i] === step.pairs[i] ? 'correct' : 'wrong') : null}
                disabled={checked}
                large
                accessibilityLabel={label(text, pair, picked)}
                onPress={() => onPick('left', i)}
              />
            );
          })}
        </View>
        <View accessibilityLabel={t('study.test.matchRight')} className="flex-[3] gap-2.5">
          {step.right.map((text, i) => {
            const pair = pairNumber(state.pairs, leftOf(state.pairs, i));
            const picked = state.picked?.side === 'right' && state.picked.index === i;
            return (
              <MatchItemButton
                key={text}
                text={text}
                pair={pair}
                picked={picked}
                verdict={null}
                disabled={checked}
                accessibilityLabel={label(text, pair, picked)}
                onPress={() => onPick('right', i)}
              />
            );
          })}
        </View>
      </View>
      {checked ? null : (
        <View
          accessibilityRole="summary"
          accessibilityLiveRegion="polite"
          className="flex-row items-center gap-2"
        >
          <Icon name="link" size={18} color="honey-text" />
          <Text tone="honey" className="flex-1 font-sans-bold text-sm">
            {done === step.left.length || !nextFree
              ? t('study.test.matchReady')
              : t('study.test.matchStatus', { done, total: step.left.length, item: nextFree })}
          </Text>
        </View>
      )}
    </View>
  );
}
