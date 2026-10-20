import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, PressableCard, Text } from '@/components/ui';
import { formatClock } from '@/features/parent/format';
import { genitiveAz } from '@/features/parent/text';
import type { Conversation } from '@/features/parent/types';
import { HexAvatar } from './HexAvatar';
import { TeacherBadge } from './TeacherBadge';

type ConversationCardProps = { conversation: Conversation };

/** A teacher of the child: who, the last message and the unread count; opens the thread. */
export function ConversationCard({ conversation: c }: ConversationCardProps) {
  const { t } = useTranslation();
  const role = t('parent.messages.teacherOf', {
    classLabel: c.classLabel,
    child: c.childName,
    childGen: genitiveAz(c.childName),
  });
  const preview = c.last
    ? c.last.fromMe
      ? t('parent.messages.you', { text: c.last.text })
      : c.last.text
    : null;
  const unread = c.unread > 0 ? t('parent.messages.unread', { count: c.unread }) : null;

  return (
    <PressableCard
      accessibilityLabel={[t('parent.messages.openThread', { name: c.name }), role, unread, preview]
        .filter(Boolean)
        .join(', ')}
      onPress={() =>
        router.push({ pathname: '/parent/chat/[threadId]', params: { threadId: c.threadId } })
      }
      contentClassName="flex-row items-center gap-2.5 rounded-lg p-3"
      className="rounded-lg"
    >
      <HexAvatar name={c.name} tone="info" size={40} />
      <View className="min-w-0 flex-1 gap-0.5">
        <View className="flex-row flex-wrap items-center gap-1.5">
          <Text className="font-sans-black">{c.name}</Text>
          <TeacherBadge />
        </View>
        <Text className="text-xs text-muted">{role}</Text>
        {preview ? (
          <Text numberOfLines={1} className="text-sm">
            {preview}
          </Text>
        ) : null}
      </View>
      <View className="items-end gap-1">
        {c.last ? (
          <Text className="font-sans-semibold text-2xs text-muted">
            {formatClock(t, new Date(c.last.at), new Date())}
          </Text>
        ) : null}
        {unread ? (
          <View className="h-[20px] min-w-[20px] items-center justify-center rounded-full bg-err px-1.5">
            <Text className="font-sans-black text-2xs text-page">{String(c.unread)}</Text>
          </View>
        ) : (
          <Icon name="chevron" size={18} color="muted" />
        )}
      </View>
    </PressableCard>
  );
}
