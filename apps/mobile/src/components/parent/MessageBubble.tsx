import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, IconButton, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

type MessageBubbleProps = {
  from: 'teacher' | 'me';
  text: string;
  /** "10:12" under a teacher message; "10:30 · Oxundu" or "Göndərilir…" under the parent's. */
  meta: string;
  authorName: string;
  /** Still on its way (shown faded). */
  pending?: boolean;
  reported?: boolean;
  onMenu?: () => void;
};

/** One chat bubble: the teacher's on the left with a "⋯" menu, the parent's honey on the right. */
export function MessageBubble({
  from,
  text,
  meta,
  authorName,
  pending = false,
  reported = false,
  onMenu,
}: MessageBubbleProps) {
  const { t } = useTranslation();

  if (from === 'me') {
    return (
      <View
        accessible
        accessibilityLabel={t('parent.chat.fromMe', { status: meta, text })}
        className={cn(
          'max-w-[82%] gap-1 self-end rounded-t-[18px] rounded-bl-[18px] rounded-br-[4px] bg-honey px-3 py-2.5',
          pending && 'opacity-70',
        )}
      >
        <Text className="text-on-honey">{text}</Text>
        <View className="flex-row items-center justify-end gap-1">
          {pending ? <Icon name="clock" size={12} color="on-honey" /> : null}
          <Text className="font-sans-bold text-2xs text-on-honey">{meta}</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="max-w-[92%] flex-row items-end gap-1">
      <View
        accessible
        accessibilityLabel={t('parent.chat.fromTeacher', { name: authorName, time: meta, text })}
        className="min-w-0 flex-1 gap-1 rounded-t-[18px] rounded-bl-[4px] rounded-br-[18px] border border-border bg-surf px-3 py-2.5"
      >
        <Text>{text}</Text>
        <Text className="font-sans-semibold text-2xs text-muted">{meta}</Text>
        {reported ? (
          <View className="flex-row items-center gap-1">
            <Icon name="report" size={12} color="err" />
            <Text className="font-sans-bold text-2xs text-err">{t('parent.chat.reported')}</Text>
          </View>
        ) : null}
      </View>
      {onMenu ? (
        <IconButton
          icon="more"
          color="muted"
          accessibilityLabel={t('parent.chat.menu')}
          onPress={onMenu}
        />
      ) : null}
    </View>
  );
}
