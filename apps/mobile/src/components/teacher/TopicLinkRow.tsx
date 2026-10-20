import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Sheet, Text } from '@/components/ui';
import type { TopicView } from '@/features/teacher/types';
import { useTeacherFormat } from '@/features/teacher/useTeacherFormat';
import { SmallButton } from './SmallButton';

type TopicLinkRowProps = {
  topics: TopicView[];
  value: string;
  onChange: (topicId: string) => void;
  locked?: boolean;
};

/** "Mövzu: 4.3 · …" — the topic the answer is bound to, so the student gets the right lesson. */
export function TopicLinkRow({ topics, value, onChange, locked }: TopicLinkRowProps) {
  const { t } = useTranslation();
  const f = useTeacherFormat();
  const [open, setOpen] = useState(false);
  const line = f.topicLine(topics.find((x) => x.id === value));

  return (
    <View className="min-h-[52px] flex-row items-center gap-2.5 rounded-md bg-raised py-1 pl-3 pr-1">
      <Icon name="link" size={18} color="honey-text" />
      <Text className="min-w-0 flex-1 text-sm">
        <Text className="font-sans-semibold text-sm text-muted">{t('teacher.answer.topic')}</Text>
        <Text className="font-sans-black text-sm">{line}</Text>
      </Text>
      {locked ? null : (
        <SmallButton
          variant="ghost"
          label={t('teacher.answer.change')}
          onPress={() => setOpen(true)}
        />
      )}
      <Sheet visible={open} onClose={() => setOpen(false)} title={t('teacher.answer.topicSheet')}>
        <View accessibilityRole="radiogroup" className="gap-1.5">
          {topics.map((topic) => {
            const on = topic.id === value;
            return (
              <Pressable
                key={topic.id}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                onPress={() => {
                  onChange(topic.id);
                  setOpen(false);
                }}
                className="min-h-touch flex-row items-center gap-3 rounded-md border border-border bg-page px-3"
              >
                <Text className="flex-1 font-sans-bold">{f.topicLine(topic)}</Text>
                {on ? <Icon name="check" size={20} color="honey-text" /> : null}
              </Pressable>
            );
          })}
        </View>
      </Sheet>
    </View>
  );
}
