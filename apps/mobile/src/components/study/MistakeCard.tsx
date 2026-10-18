import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import { MathText } from '@/components/tests/MathText';
import { SourceLine } from '@/components/tests/SourceLine';
import type { MistakeItem } from '@/features/study/types';
import { fontSize } from '@/theme';

function AnswerRow({ ok, label, value }: { ok: boolean; label: string; value: string }) {
  return (
    <View className="flex-row items-start gap-1.5">
      <Icon name={ok ? 'check' : 'x'} size={16} color={ok ? 'ok' : 'err'} />
      <Text tone="muted" className="text-sm">
        {label}
      </Text>
      <View className="min-w-0 flex-1">
        <MathText
          text={value || '—'}
          fontSize={fontSize.sm[0]}
          className="font-sans-bold text-sm"
        />
      </View>
    </View>
  );
}

/** One missed question: both answers, its source and the source's explanation (or Vızı). */
export function MistakeCard({ item }: { item: MistakeItem }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <View className="gap-1.5 rounded-lg border border-border bg-surf px-3 py-2.5">
      <MathText text={item.stem} fontSize={fontSize.base[0]} className="font-sans-bold" />
      <AnswerRow ok={false} label={t('study.mistakes.yours')} value={item.yours} />
      <AnswerRow ok label={t('study.mistakes.right')} value={item.right} />
      <View className="flex-row items-center gap-2">
        <SourceLine source={item.source} className="flex-1" />
        {item.explanation ? (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: open }}
            accessibilityLabel={
              open ? t('study.mistakes.hideExplanation') : t('study.mistakes.seeExplanation')
            }
            onPress={() => setOpen(!open)}
            hitSlop={4}
            className="min-h-9 justify-center rounded-sm border border-border px-2.5 active:bg-wax"
          >
            <Text tone="honey" className="font-sans-black text-sm">
              {open ? t('study.mistakes.hideExplanation') : t('study.mistakes.seeExplanation')}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {item.explanation && open ? (
        <View className="rounded-md bg-raised px-2.5 py-2">
          <MathText text={item.explanation} fontSize={fontSize.sm[0]} className="text-sm" />
        </View>
      ) : null}
      {item.explanation ? null : (
        <View className="flex-row items-center gap-2 rounded-md bg-raised py-1.5 pl-2.5 pr-1.5">
          <Text className="min-w-0 flex-1 text-sm">{t('study.mistakes.noExplanation')}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('study.common.askVizi')}
            onPress={() => router.push('/chat')}
            hitSlop={4}
            className="min-h-9 flex-row items-center gap-1.5 rounded-sm bg-surf px-2.5 active:bg-wax"
          >
            <Icon name="chat" size={16} color="honey-text" />
            <Text tone="honey" className="font-sans-black text-sm">
              {t('study.common.askVizi')}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
