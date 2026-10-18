import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, IconButton, Text } from '@/components/ui';
import { useThemeColors } from '@/theme';
import { cn } from '@/lib/cn';

type ChatInputBarProps = {
  /** `busy`: Vızı is answering (stop instead of send); `locked`: today's limit is used up. */
  mode: 'ready' | 'busy' | 'locked' | 'offline';
  onSend: (text: string) => void;
  onStop: () => void;
  onAttach: () => void;
};

/** Message field with photo, send and stop; locked or offline it says why in words. */
export function ChatInputBar({ mode, onSend, onStop, onAttach }: ChatInputBarProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const ready = mode === 'ready';

  function send() {
    if (!ready || text.trim().length === 0) return;
    onSend(text);
    setText('');
  }

  return (
    <View
      className="flex-row items-center gap-1 border-t border-border bg-surf px-2.5 pt-2"
      // The home indicator inset is device-specific, so it cannot be a static className.
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      {mode === 'locked' || mode === 'offline' ? (
        <View
          accessibilityRole="text"
          accessibilityLiveRegion="polite"
          className="min-h-[44px] flex-1 flex-row items-center justify-center gap-2 rounded-full bg-wax px-3.5"
        >
          <Icon name={mode === 'locked' ? 'lock' : 'offline'} size={16} color="lock-ink" />
          <Text className="flex-shrink font-sans-bold text-sm text-lock-ink">
            {mode === 'locked' ? t('ask.chat.locked') : t('ask.chat.offline')}
          </Text>
        </View>
      ) : (
        <>
          <IconButton
            icon="image"
            color={ready ? 'muted' : 'lock-ink'}
            accessibilityLabel={t('ask.chat.attach')}
            onPress={() => ready && onAttach()}
          />
          <View
            className={cn(
              'h-[44px] min-w-0 flex-1 justify-center rounded-full px-3.5',
              ready ? 'border border-border bg-page' : 'bg-wax',
            )}
          >
            <TextInput
              accessibilityLabel={t('ask.chat.input')}
              value={text}
              onChangeText={setText}
              onSubmitEditing={send}
              editable={ready}
              returnKeyType="send"
              placeholder={ready ? t('ask.chat.placeholder') : t('ask.chat.placeholderBusy')}
              placeholderTextColor={ready ? colors.muted : colors['lock-ink']}
              className="font-sans text-base text-ink"
            />
          </View>
          {mode === 'busy' ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('ask.chat.stop')}
              onPress={onStop}
              className="h-[44px] w-[44px] items-center justify-center rounded-full border-2 border-border bg-surf"
            >
              <View className="h-3 w-3 rounded-[3px] bg-ink" />
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('ask.chat.send')}
              accessibilityState={{ disabled: text.trim().length === 0 }}
              onPress={send}
              className="h-[44px] w-[44px] items-center justify-center rounded-full bg-honey active:bg-honey-deep"
            >
              <Icon name="send" size={20} color="on-honey" />
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}
