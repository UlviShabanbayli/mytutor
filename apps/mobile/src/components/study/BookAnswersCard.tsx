import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, SourceLine, Text } from '@/components/ui';
import type { BookAnswerRow } from '@/features/study/types';

type BookAnswersCardProps = {
  answers: { source: string; items: BookAnswerRow[] };
};

/**
 * The book's own answers to the exercises on the topic's pages, folded until asked for, so the
 * student solves first in the paper book and checks after.
 */
export function BookAnswersCard({ answers }: BookAnswersCardProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const label = open ? t('study.lesson.bookAnswersHide') : t('study.lesson.bookAnswersShow');

  return (
    <View className="gap-2 rounded-xl border border-border bg-surf px-3.5 py-3">
      <View className="flex-row items-center gap-2">
        <Icon name="book" size={18} color="honey-text" />
        <View className="min-w-0 flex-1">
          <Text className="font-sans-black">{t('study.lesson.bookAnswersTitle')}</Text>
          <Text variant="caption" tone="muted">
            {t('study.lesson.bookAnswersCount', { count: answers.items.length })}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          accessibilityLabel={label}
          onPress={() => setOpen(!open)}
          className="min-h-touch justify-center rounded-sm px-2 active:bg-wax"
        >
          <Text tone="honey" className="font-sans-black text-sm">
            {label}
          </Text>
        </Pressable>
      </View>
      {open
        ? answers.items.map((row) => (
            <View key={row.id} accessible className="flex-row gap-2 border-t border-border pt-2">
              <Text className="w-[76px] font-sans-black text-sm">
                {t('study.lesson.bookAnswerNumber', { exercise: row.exercise, page: row.page })}
              </Text>
              <Text className="min-w-0 flex-1 text-sm">{row.text}</Text>
            </View>
          ))
        : null}
      <SourceLine source={answers.source} />
    </View>
  );
}
