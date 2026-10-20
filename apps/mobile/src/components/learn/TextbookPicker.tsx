import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text } from '@/components/ui';
import { Mascot } from '@/components/mascot/Mascot';
import { useLearnData, useLearnStore } from '@/features/learn/store';
import type { Hive } from '@/features/learn/types';
import { useLearnText } from '@/features/learn/useLearnText';
import { CenterHeader } from './CenterHeader';
import { TextbookOption } from './TextbookOption';

type TextbookPickerProps = {
  hive: Hive;
  onDone: () => void;
};

/**
 * "Məktəbində hansı dərslik var?" (open question Q6 of the architecture): the student's school
 * textbook. Topics come from a ready one meanwhile; the choice can be changed from the hive.
 */
export function TextbookPicker({ hive, onDone }: TextbookPickerProps) {
  const { t, hiveName, bookName } = useLearnText();
  const stored = useLearnData((d) => d.textbooks[hive.id]);
  const pick = useLearnStore((s) => s.pickTextbook);
  const [selected, setSelected] = useState(
    stored && stored !== 'unknown' ? stored : hive.textbookId,
  );
  const done = (id: string) => {
    pick(hive.id, id);
    onDone();
  };

  return (
    <SafeAreaView className="flex-1 bg-page">
      <CenterHeader title={hiveName(hive)} backLabel={t('common.back')} onBack={router.back} />
      <ScrollView contentContainerClassName="flex-grow gap-3.5 px-4 pb-4 pt-1">
        <View className="flex-row items-end gap-1.5">
          <Mascot moment="aiExplains" size={84} />
          <View className="mb-2.5 flex-1 rounded-[18px] rounded-bl-[4px] border border-border bg-surf px-3 py-2.5">
            <Text className="font-sans-semibold text-sm">{t('learn.textbook.bubble')}</Text>
          </View>
        </View>
        <Text variant="heading" className="font-display-black text-2xl">
          {t('learn.textbook.title')}
        </Text>
        <View
          accessibilityRole="radiogroup"
          accessibilityLabel={t('learn.textbook.group')}
          className="gap-2.5"
        >
          {hive.textbooks.map((book) => (
            <TextbookOption
              key={book.id}
              book={book}
              fallback={bookName(hive)}
              selected={book.id === selected}
              onPress={() => setSelected(book.id)}
            />
          ))}
        </View>
        <View className="flex-1" />
        <Text variant="caption" tone="muted" className="text-center font-sans">
          {t('learn.textbook.note')}
        </Text>
        <Button label={t('learn.textbook.continue')} onPress={() => done(selected)} />
        <Button
          variant="text"
          size="md"
          label={t('learn.textbook.unknown')}
          onPress={() => done('unknown')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
