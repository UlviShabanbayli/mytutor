import { Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { isUnread } from '@/features/today/inbox';
import { useTodayStore } from '@/features/today/store';
import type { InboxItem } from '@/features/today/types';
import { cn } from '@/lib/cn';

type ReadAllButtonProps = {
  items: InboxItem[];
};

/** "Hamısını oxu" in the inbox header; inactive when nothing is unread. */
export function ReadAllButton({ items }: ReadAllButtonProps) {
  const { t } = useTranslation();
  const readIds = useTodayStore((s) => s.readIds);
  const markRead = useTodayStore((s) => s.markRead);
  const unreadIds = items.filter((i) => isUnread(i, readIds)).map((i) => i.id);
  const none = unreadIds.length === 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: none }}
      disabled={none}
      onPress={() => markRead(unreadIds)}
      className="min-h-touch justify-center px-2 active:opacity-70"
    >
      <Text className={cn('font-sans-black text-sm', none ? 'text-lock-ink' : 'text-honey-text')}>
        {t('today.inbox.readAll')}
      </Text>
    </Pressable>
  );
}
