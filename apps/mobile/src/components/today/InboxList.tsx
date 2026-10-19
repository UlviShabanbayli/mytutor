import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { inboxDayHeading } from '@/features/today/format';
import { groupInbox, inboxHref, isUnread } from '@/features/today/inbox';
import { useTodayStore } from '@/features/today/store';
import type { InboxItem } from '@/features/today/types';
import { InboxRow } from './InboxRow';

type InboxListProps = {
  items: InboxItem[];
};

/** Notifications by day, newest first; opening one marks it read and goes to its screen. */
export function InboxList({ items }: InboxListProps) {
  const { t } = useTranslation();
  const readIds = useTodayStore((s) => s.readIds);
  const markRead = useTodayStore((s) => s.markRead);
  const groups = groupInbox(items, new Date());

  return (
    <View className="gap-1.5">
      {groups.map((group) => (
        <View key={group.key} className="gap-1.5">
          <Text
            accessibilityRole="header"
            className="mb-0.5 mt-2.5 font-sans-black text-xs uppercase tracking-[1px] text-muted"
          >
            {inboxDayHeading(t, group)}
          </Text>
          {group.items.map((item) => (
            <InboxRow
              key={item.id}
              item={item}
              unread={isUnread(item, readIds)}
              onPress={() => {
                markRead([item.id]);
                router.push(inboxHref(item));
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
