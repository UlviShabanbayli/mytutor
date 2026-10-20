import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StaggerGroup, StaggerItem, Text } from '@/components/ui';
import { inboxDayHeading } from '@/features/today/format';
import { groupInbox, inboxHref, isUnread } from '@/features/today/inbox';
import type { InboxItem } from '@/features/today/types';
import { useDemoWrite } from '@/lib/demoEvents';
import { InboxRow } from './InboxRow';

type InboxListProps = {
  items: InboxItem[];
};

/**
 * Notifications by day, newest first; opening one marks it read (a demo event, so the read state
 * holds on every screen) and goes to its screen. The
 * rows come in one after another when the list first shows (transitions.list C).
 */
export function InboxList({ items }: InboxListProps) {
  const { t } = useTranslation();
  const write = useDemoWrite();
  const groups = groupInbox(items, new Date());
  // Rows are counted across the day groups, so the stagger runs down the whole list.
  const offsets = groups.map((_, g) =>
    groups.slice(0, g).reduce((sum, group) => sum + group.items.length, 0),
  );

  return (
    <StaggerGroup>
      <View className="gap-1.5">
        {groups.map((group, g) => (
          <View key={group.key} className="gap-1.5">
            <Text
              accessibilityRole="header"
              className="mb-0.5 mt-2.5 font-sans-black text-xs uppercase tracking-[1px] text-muted"
            >
              {inboxDayHeading(t, group)}
            </Text>
            {group.items.map((item, i) => (
              <StaggerItem key={item.id} index={(offsets[g] ?? 0) + i}>
                <InboxRow
                  item={item}
                  unread={isUnread(item)}
                  onPress={() => {
                    if (isUnread(item))
                      write({ type: 'notification.read', notificationId: item.id });
                    router.push(inboxHref(item));
                  }}
                />
              </StaggerItem>
            ))}
          </View>
        ))}
      </View>
    </StaggerGroup>
  );
}
