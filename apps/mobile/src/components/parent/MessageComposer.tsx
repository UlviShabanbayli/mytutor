import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Icon, useRaisedPress } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/theme';

type MessageComposerProps = {
  /** The teacher's first name, for the placeholder "Lalə müəllimə yaz…". */
  teacherName: string;
  onSend: (text: string) => void;
};

/** The message field and the honey send button pinned under the thread. */
export function MessageComposer({ teacherName, onSend }: MessageComposerProps) {
  const press = useRaisedPress({ depth: 3 });
  const { t } = useTranslation();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const ready = text.trim().length > 0;

  const send = () => {
    if (!ready) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <View
      className="flex-row items-center gap-2 border-t border-border bg-page px-4 pt-2"
      // The home indicator inset is device-specific, so it cannot be a static className.
      style={{ paddingBottom: Math.max(insets.bottom, 10) }}
    >
      <TextInput
        value={text}
        onChangeText={setText}
        onSubmitEditing={send}
        placeholder={t('parent.chat.placeholder', { name: teacherName })}
        placeholderTextColor={colors.muted}
        accessibilityLabel={t('parent.chat.inputLabel', { name: teacherName })}
        multiline
        numberOfLines={1}
        className="max-h-28 min-h-[48px] flex-1 rounded-lg border border-border bg-surf px-3.5 py-3 font-sans text-base text-ink"
      />
      <Pressable
        onPressIn={press.pressIn}
        onPressOut={press.pressOut}
        accessibilityRole="button"
        accessibilityLabel={t('parent.chat.send')}
        accessibilityState={{ disabled: !ready }}
        disabled={!ready}
        onPress={send}
        className={cn('rounded-lg', ready && 'bg-honey-deep pb-[3px]')}
      >
        <Animated.View style={press.faceStyle}>
          <View
            className={cn(
              'h-[48px] w-[48px] items-center justify-center rounded-lg',
              ready ? 'bg-honey' : 'bg-wax',
            )}
          >
            <Icon name="send" size={22} color={ready ? 'on-honey' : 'lock-ink'} />
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
}
