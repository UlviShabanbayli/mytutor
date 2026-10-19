import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { ChatMessage } from '@/features/teacher/types';
import { useTeacherFormat } from '@/features/teacher/useTeacherFormat';

type MessageBubbleProps = { message: ChatMessage };

/** One chat message; the teacher's own sit on the right in raised honey. */
export function MessageBubble({ message: m }: MessageBubbleProps) {
  const { t } = useTranslation();
  const f = useTeacherFormat();
  const mine = m.author === null;

  return (
    <View
      className={cn(
        'max-w-[85%] gap-0.5 rounded-lg px-3 py-2',
        mine ? 'self-end bg-raised' : 'self-start border border-border bg-surf',
      )}
    >
      <Text className="font-sans-black text-xs text-muted">
        {mine ? t('teacher.live.me') : m.author}
      </Text>
      <Text className="font-sans text-sm">{m.text}</Text>
      <Text className="font-sans text-2xs text-muted">{f.dayAt(new Date(m.at))}</Text>
    </View>
  );
}
