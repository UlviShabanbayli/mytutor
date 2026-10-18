import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Icon, IconButton, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/theme';

type ChatComposerProps = {
  replyTo: string | null;
  onCancelReply: () => void;
  onAttach: () => void;
  onSend: (text: string) => void;
  disabled?: boolean;
};

/** The message field: attach, text, send, and the "Cavab: …" line while replying. */
export function ChatComposer({
  replyTo,
  onCancelReply,
  onAttach,
  onSend,
  disabled = false,
}: ChatComposerProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const canSend = text.trim().length > 0 && !disabled;
  const send = () => {
    if (!canSend) return;
    onSend(text);
    setText('');
  };

  return (
    <View
      className="border-t border-border bg-surf px-3 pt-2"
      // The home indicator inset is device-specific, so it cannot be a static className.
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      {replyTo ? (
        <View className="flex-row items-center gap-2 pb-1 pl-1">
          <Icon name="chat" size={16} color="honey-text" />
          <Text className="flex-1 font-sans-bold text-sm text-honey-text">
            {t('me.chat.replyTo', { name: replyTo })}
          </Text>
          <IconButton
            icon="close"
            color="muted"
            accessibilityLabel={t('me.chat.cancelReply')}
            onPress={onCancelReply}
          />
        </View>
      ) : null}
      <View className="flex-row items-center gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('me.chat.attach')}
          onPress={onAttach}
          className="h-11 w-11 items-center justify-center rounded-md bg-raised"
        >
          <Icon name="plus" size={22} />
        </Pressable>
        <View className="h-11 flex-1 flex-row items-center rounded-full border border-border bg-page px-3.5">
          <TextInput
            value={text}
            onChangeText={setText}
            onSubmitEditing={send}
            editable={!disabled}
            accessibilityLabel={t('me.chat.inputLabel')}
            placeholder={t('me.chat.placeholder')}
            placeholderTextColor={colors.muted}
            returnKeyType="send"
            maxLength={1000}
            className="h-full flex-1 font-sans text-base text-ink"
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('me.chat.send')}
          accessibilityState={{ disabled: !canSend }}
          disabled={!canSend}
          onPress={send}
          className={cn(
            'h-11 w-11 items-center justify-center rounded-md',
            canSend ? 'bg-honey' : 'bg-wax',
          )}
        >
          <Icon name="send" size={20} color={canSend ? 'on-honey' : 'lock-ink'} />
        </Pressable>
      </View>
    </View>
  );
}
