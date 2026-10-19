import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Sheet, Text } from '@/components/ui';
import { firstName } from '@/features/teacher/people';
import type { InboxQuestion } from '@/features/teacher/types';
import { LinedPage } from './LinedPage';

type QuestionHeaderProps = { question: InboxQuestion };

/** The student's photo (or typed question) and what they wrote next to it. */
export function QuestionHeader({ question: q }: QuestionHeaderProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <View
      accessibilityLabel={t('teacher.answer.question')}
      className="flex-row items-stretch gap-2.5"
    >
      {q.photo ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('teacher.answer.photo')}
          onPress={() => setOpen(true)}
          className="min-h-[104px] w-[132px] overflow-hidden rounded-md border border-border bg-surf active:opacity-80"
        >
          <LinedPage lines={[q.topicId, q.photo.formula]} minLines={4} />
          <View className="absolute bottom-1.5 right-1.5 h-[26px] w-[26px] items-center justify-center rounded-[8px] bg-raised">
            <Icon name="search" size={14} color="ink" />
          </View>
        </Pressable>
      ) : (
        <View className="w-[132px] justify-center rounded-md border border-border bg-surf p-2.5">
          <Text className="font-sans-bold text-sm">{q.text}</Text>
        </View>
      )}
      <View className="min-w-0 flex-1 gap-1 rounded-b-lg rounded-tl-lg rounded-tr-sm border border-border bg-surf px-3 py-2.5">
        <Text variant="overline" tone="muted">
          {t('teacher.answer.writes', { name: firstName(q.studentName) })}
        </Text>
        <Text className="font-sans text-sm leading-[20px]">{q.note}</Text>
      </View>
      <Sheet visible={open} onClose={() => setOpen(false)} title={t('teacher.answer.photoSheet')}>
        <View className="rounded-lg border border-border bg-surf pb-3">
          <LinedPage
            lines={[q.topicId, q.photo?.formula ?? '', q.text]}
            size="large"
            minLines={5}
          />
        </View>
      </Sheet>
    </View>
  );
}
