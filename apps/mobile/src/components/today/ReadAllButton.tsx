import { Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { isUnread } from '@/features/today/inbox';
import type { InboxItem } from '@/features/today/types';
import { useDemoWrite } from '@/lib/demoEvents';
import { cn } from '@/lib/cn';

type ReadAllButtonProps = {
  items: InboxItem[];
};

/** "Hamısını oxu" in the inbox header; inactive when nothing is unread. */
export function ReadAllButton({ items }: ReadAllButtonProps) {
  const { t } = useTranslation();
  const write = useDemoWrite();
  const unreadIds = items.filter(isUnread).map((i) => i.id);
  const none = unreadIds.length === 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: none }}
      disabled={none}
      onPress={() =>
        unreadIds.forEach((id) => write({ type: 'notification.read', notificationId: id }))
      }
      className="min-h-touch justify-center px-2 active:opacity-70"
    >
      <Text className={cn('font-sans-black text-sm', none ? 'text-lock-ink' : 'text-honey-text')}>
        {t('today.inbox.readAll')}
      </Text>
    </Pressable>
  );
}
