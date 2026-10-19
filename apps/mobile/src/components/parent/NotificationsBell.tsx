import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui';
import { useMarkNotificationsRead, useNotifications } from '@/features/parent/queries';
import { NotificationsSheet } from './NotificationsSheet';

/** The bell on "Uşaqlarım" with a red dot for unread notifications; it opens the list. */
export function NotificationsBell() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const notifications = useNotifications();
  const markRead = useMarkNotificationsRead();
  const unread = notifications.data?.unread ?? 0;

  const show = () => {
    setOpen(true);
    if (unread > 0) markRead.mutate();
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          unread > 0 ? t('parent.kids.bellUnread', { count: unread }) : t('parent.kids.bell')
        }
        onPress={show}
        className="h-[44px] w-[44px] items-center justify-center rounded-md border border-border bg-surf active:bg-wax"
      >
        <Icon name="bell" size={22} />
        {unread > 0 ? (
          <View className="absolute right-2.5 top-2 h-[9px] w-[9px] rounded-full border-2 border-surf bg-err" />
        ) : null}
      </Pressable>
      <NotificationsSheet
        visible={open}
        onClose={() => setOpen(false)}
        items={notifications.data?.items ?? []}
      />
    </>
  );
}
