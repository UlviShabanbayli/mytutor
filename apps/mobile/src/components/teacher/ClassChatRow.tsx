import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Switch, Text } from '@/components/ui';
import { useSetClassChat } from '@/features/teacher/mutations';
import type { TeacherClass } from '@/features/teacher/types';

type ClassChatRowProps = { cls: TeacherClass; mutedCount: number };

/**
 * The class chat switch (M2 "sinif söhbətini açıb-bağlamaq") with its news, written as the demo
 * event `class.chatSet`: a closed chat takes no students' messages.
 */
export function ClassChatRow({ cls, mutedCount }: ClassChatRowProps) {
  const { t } = useTranslation();
  const setChat = useSetClassChat();
  const open = cls.chatOpen;
  const parts = open
    ? [
        t('teacher.class.chatOpen'),
        cls.chatUnread > 0 ? t('teacher.class.newMessages', { count: cls.chatUnread }) : null,
        mutedCount > 0 ? t('teacher.class.mutedStudents', { count: mutedCount }) : null,
      ]
    : [t('teacher.class.chatClosed')];

  return (
    <View className="flex-row items-center gap-3 rounded-lg bg-raised py-2 pl-3 pr-2">
      <Icon name="chat" size={22} color="honey-text" />
      <View className="min-w-0 flex-1 gap-px">
        <Text className="font-sans-black">{t('teacher.class.chat')}</Text>
        <Text variant="caption" tone="muted" className="font-sans">
          {parts.filter(Boolean).join(' · ')}
        </Text>
      </View>
      <Switch
        value={open}
        onValueChange={(value) => setChat.mutate({ classId: cls.id, open: value })}
        accessibilityLabel={
          open ? t('teacher.class.chatSwitchOn') : t('teacher.class.chatSwitchOff')
        }
      />
    </View>
  );
}
