import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, Text } from '@/components/ui';
import type { ChatMessage } from '@/features/me/types';
import { cn } from '@/lib/cn';
import { Hex } from './Hex';

type ChatBubbleProps = {
  message: ChatMessage;
  reported: boolean;
  /** Opens the message menu (reply, copy, report); tap or long press. */
  onOpenMenu: () => void;
};

/** One class-chat message: classmates and the teacher on the left, the student's own in honey. */
export function ChatBubble({ message, reported, onOpenMenu }: ChatBubbleProps) {
  const { t } = useTranslation();
  const teacher = message.role === 'teacher';
  const label = message.mine
    ? t('me.chat.mineLabel', { text: message.text, time: message.time })
    : t('me.chat.messageLabel', { author: message.author, text: message.text, time: message.time });
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={reported ? `${label}. ${t('me.chat.reported')}` : label}
      accessibilityHint={t('me.chat.messageHint')}
      onPress={onOpenMenu}
      onLongPress={onOpenMenu}
      className={cn('max-w-[86%] flex-row items-end gap-2', message.mine && 'max-w-[80%] self-end')}
    >
      {message.mine ? null : (
        <Hex width={30} fill={teacher ? 'spot' : 'crystal'}>
          <Text
            className={cn('font-sans-black text-2xs', teacher ? 'text-honey' : 'text-crystal-ink')}
          >
            {message.initials}
          </Text>
        </Hex>
      )}
      <View className={cn('shrink gap-[3px]', message.mine && 'items-end')}>
        {message.mine ? null : (
          <View className="flex-row items-center gap-1.5">
            <Text className="font-sans-black text-sm">{message.author}</Text>
            {teacher ? (
              <View className="h-[18px] flex-row items-center gap-[3px] rounded-full bg-ok-bg px-1.5">
                <Icon name="check" size={11} color="ok" />
                <Text className="font-sans-black text-[10.5px] text-ok">
                  {t('me.shared.teacher')}
                </Text>
              </View>
            ) : null}
          </View>
        )}
        {message.replyTo ? (
          <Text tone="muted" className="text-xs">
            {t('me.chat.replyTo', { name: message.replyTo })}
          </Text>
        ) : null}
        <View
          className={cn(
            'px-3 py-[9px]',
            message.mine
              ? 'rounded-[18px] rounded-tr-[4px] bg-honey'
              : 'rounded-[18px] rounded-tl-[4px] border border-border bg-surf',
          )}
        >
          <Text className={cn('leading-5', message.mine && 'font-sans-semibold text-on-honey')}>
            {message.text}
          </Text>
        </View>
        <View className="flex-row items-center gap-[3px]">
          <Text tone="muted" className="text-2xs">
            {reported ? `${message.time} · ${t('me.chat.reported')}` : message.time}
          </Text>
          {message.mine ? (
            <Icon name="check" size={12} color="muted" accessibilityLabel={t('me.chat.sent')} />
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
