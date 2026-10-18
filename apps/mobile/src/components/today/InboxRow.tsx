import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { inboxText, inboxTime } from '@/features/today/format';
import type { InboxItem } from '@/features/today/types';
import { cn } from '@/lib/cn';
import { InboxBadge } from './InboxBadge';

type InboxRowProps = {
  item: InboxItem;
  unread: boolean;
  onPress: () => void;
};

/** One notification; unread ones get a honey border, a warm ground and a red dot. */
export function InboxRow({ item, unread, onPress }: InboxRowProps) {
  const { t } = useTranslation();
  const now = new Date();
  const { title, body } = inboxText(t, item, now);
  const time = inboxTime(t, new Date(item.at), now);
  const state = unread ? t('today.inbox.unread') : t('today.inbox.read');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('today.inbox.rowLabel', { title, body, time, state })}
      onPress={onPress}
      className={cn(
        'min-h-[70px] flex-row items-center gap-3 rounded-lg px-3 py-2.5 active:opacity-80',
        unread ? 'border-2 border-honey bg-raised' : 'border border-border bg-surf',
      )}
    >
      <InboxBadge item={item} />
      <View className="min-w-0 flex-1 gap-0.5">
        <Text className="font-sans-black">{title}</Text>
        <Text tone="muted" className="text-sm">
          {body}
        </Text>
      </View>
      <View className="shrink-0 items-end gap-1.5">
        <Text className="font-sans-bold text-xs text-muted">{time}</Text>
        <View className={cn('h-2.5 w-2.5 rounded-full', unread ? 'bg-err' : 'bg-transparent')} />
      </View>
    </Pressable>
  );
}
