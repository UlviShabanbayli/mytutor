import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui';
import { useUnreadCount } from '@/features/today/hooks';
import { cn } from '@/lib/cn';

/** The bell in the header: opens the inbox; a red dot while something is unread. */
export function InboxBell() {
  const { t } = useTranslation();
  const unread = useUnreadCount();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        unread > 0 ? t('today.header.inboxUnread', { count: unread }) : t('today.header.inbox')
      }
      onPress={() => router.push('/inbox')}
      className={cn(
        'h-[44px] w-[44px] items-center justify-center rounded-md border border-border bg-surf',
        'active:bg-wax',
      )}
    >
      <Icon name="bell" size={22} />
      {unread > 0 ? (
        <View className="absolute right-2.5 top-2 h-[10px] w-[10px] rounded-full border-2 border-surf bg-err" />
      ) : null}
    </Pressable>
  );
}
