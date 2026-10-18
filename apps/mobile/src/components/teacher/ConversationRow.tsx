import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PressableCard, Text } from '@/components/ui';
import { initials } from '@/features/teacher/people';
import type { Conversation } from '@/features/teacher/types';
import { useTeacherFormat } from '@/features/teacher/useTeacherFormat';
import { CountDot } from './CountDot';
import { HexBadge } from './HexBadge';

type ConversationRowProps = { conversation: Conversation; onPress: () => void };

/** A conversation: who, the last message and the unread count. */
export function ConversationRow({ conversation: c, onPress }: ConversationRowProps) {
  const { t } = useTranslation();
  const f = useTeacherFormat();
  const last = c.messages[c.messages.length - 1];
  const subtitle =
    c.kind === 'class'
      ? t('teacher.messages.classChat')
      : c.kind === 'parent'
        ? t('teacher.messages.parentOf', { child: c.child ?? '' })
        : t('teacher.messages.student');
  const preview = last
    ? last.author === null
      ? t('teacher.messages.fromMe', { text: last.text })
      : c.kind === 'class'
        ? t('teacher.messages.from', { name: last.author, text: last.text })
        : last.text
    : '';
  const time = last ? f.ago(new Date(last.at)) : '';
  const unread = c.unread > 0 ? t('teacher.messages.unread', { count: c.unread }) : '';

  return (
    <PressableCard
      accessibilityLabel={[
        t('teacher.messages.rowLabel', { title: c.title, subtitle, last: preview, time }),
        unread,
      ]
        .filter(Boolean)
        .join('. ')}
      onPress={onPress}
      className="rounded-lg"
      contentClassName="min-h-[68px] flex-row items-center gap-3 rounded-lg px-3 py-2.5"
    >
      <HexBadge
        size={40}
        tone={c.kind === 'class' ? 'honey' : 'raised'}
        label={c.kind === 'class' ? c.title.split(' ')[0] : initials(c.title)}
      />
      <View className="min-w-0 flex-1 gap-0.5">
        <View className="flex-row items-center gap-2">
          <Text numberOfLines={1} className="min-w-0 flex-1 font-sans-black">
            {c.title}
          </Text>
          <Text className="font-sans-semibold text-xs text-muted">{time}</Text>
        </View>
        <Text className="font-sans-semibold text-xs text-muted">{subtitle}</Text>
        <View className="flex-row items-center gap-2">
          <Text
            numberOfLines={1}
            className={
              c.unread > 0
                ? 'min-w-0 flex-1 font-sans-bold text-sm'
                : 'min-w-0 flex-1 font-sans text-sm text-muted'
            }
          >
            {preview}
          </Text>
          <CountDot count={c.unread} />
        </View>
      </View>
    </PressableCard>
  );
}
