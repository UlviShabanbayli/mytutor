import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Icon, Sheet, Text } from '@/components/ui';
import { formatTime } from '@/features/parent/format';
import type { ChatMessage } from '@/features/parent/types';

type MessageMenuSheetProps = {
  message: ChatMessage | null;
  authorName: string;
  /** Absent where the platform has no clipboard. */
  onCopy?: (message: ChatMessage) => void;
  onReport: (message: ChatMessage) => void;
  onClose: () => void;
};

/** What the parent can do with a teacher's message: copy it or report it to moderation (P6). */
export function MessageMenuSheet({
  message,
  authorName,
  onCopy,
  onReport,
  onClose,
}: MessageMenuSheetProps) {
  const { t } = useTranslation();
  const title = message
    ? t('parent.chat.sheetTitle', { author: authorName, time: formatTime(new Date(message.at)) })
    : '';

  return (
    <Sheet visible={message !== null} onClose={onClose} title={title} showTitle={false}>
      {message ? (
        <View className="gap-2.5">
          <Text className="font-sans-black text-xs uppercase tracking-[0.9px] text-muted">
            {title}
          </Text>
          <View className="rounded-md bg-raised px-3 py-2.5">
            <Text numberOfLines={2} className="text-sm">
              {message.text}
            </Text>
          </View>
          <View accessibilityRole="menu" className="gap-1">
            {onCopy ? (
              <Pressable
                accessibilityRole="menuitem"
                onPress={() => onCopy(message)}
                className="min-h-[52px] flex-row items-center gap-3 rounded-md px-2 active:bg-wax"
              >
                <View className="h-[36px] w-[36px] items-center justify-center rounded-[11px] bg-wax">
                  <Icon name="file" size={18} />
                </View>
                <Text className="font-sans-bold">{t('parent.chat.copy')}</Text>
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole="menuitem"
              accessibilityState={{ disabled: message.reported }}
              disabled={message.reported}
              onPress={() => onReport(message)}
              className="min-h-14 flex-row items-center gap-3 rounded-md bg-err-bg px-2 py-1.5"
            >
              <View className="h-[36px] w-[36px] items-center justify-center rounded-[11px] bg-surf">
                <Icon name="report" size={18} color="err" />
              </View>
              <View className="min-w-0 flex-1 gap-px">
                <Text className="font-sans-black text-err">
                  {message.reported ? t('parent.chat.reported') : t('parent.chat.report')}
                </Text>
                {message.reported ? null : (
                  <Text className="font-sans-semibold text-xs text-muted">
                    {t('parent.chat.reportHint')}
                  </Text>
                )}
              </View>
            </Pressable>
          </View>
          <Button variant="secondary" size="md" label={t('common.close')} onPress={onClose} />
        </View>
      ) : null}
    </Sheet>
  );
}
