import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Banner, IconButton } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useSendMessage } from '@/features/teacher/mutations';
import { useThemeColors } from '@/theme';

type ThreadComposerProps = { threadId: string };

/** The teacher's reply under a conversation: the class or the parent sees it on their side. */
export function ThreadComposer({ threadId }: ThreadComposerProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const send = useSendMessage();
  const [text, setText] = useState('');
  const ready = text.trim().length > 0 && !send.isPending;

  const submit = () => {
    if (!ready) return;
    send.mutate({ threadId, text }, { onSuccess: () => setText('') });
  };

  return (
    <View className="gap-1.5">
      <View className="flex-row items-center gap-2">
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={submit}
          placeholder={t('teacher.messages.placeholder')}
          placeholderTextColor={colors.muted}
          accessibilityLabel={t('teacher.messages.placeholder')}
          multiline
          className="max-h-28 min-h-[44px] flex-1 rounded-md border-2 border-border bg-page px-3 py-2.5 font-sans text-base text-ink"
        />
        <View className={cn('rounded-md', ready ? 'bg-honey' : 'bg-wax')}>
          <IconButton
            icon="send"
            color={ready ? 'on-honey' : 'lock-ink'}
            accessibilityLabel={t('teacher.messages.send')}
            onPress={submit}
          />
        </View>
      </View>
      {send.isError ? <Banner kind="error" message={t('common.errorDescription')} /> : null}
    </View>
  );
}
