import { useState } from 'react';
import { View } from 'react-native';
import { type TabItem, TabBarItem } from '@/components/navigation/TabBarItem';
import { Button } from '@/components/ui';

const ITEMS: TabItem[] = [
  { name: 'today', label: 'Bu gün', icon: 'today' },
  { name: 'learn', label: 'Öyrən', icon: 'learn' },
  { name: 'ask', label: 'Soruş', icon: 'ask', center: true },
  { name: 'exam', label: 'İmtahan', icon: 'exam' },
  { name: 'me', label: 'Mən', icon: 'me' },
];

/** buttons.tabbar C and micro.badge B outside a navigator: tap the items, add notifications. */
export function TabBarDemo() {
  const [current, setCurrent] = useState('today');
  const [unread, setUnread] = useState(0);

  return (
    <View className="gap-2">
      <View className="flex-row rounded-lg border border-border bg-surf px-1.5 pb-2 pt-1.5">
        {ITEMS.map((item) => (
          <TabBarItem
            key={item.name}
            item={item.name === 'me' ? { ...item, badge: unread || undefined } : item}
            focused={current === item.name}
            onPress={() => {
              setCurrent(item.name);
              if (item.name === 'me') setUnread(0);
            }}
            onLongPress={() => undefined}
          />
        ))}
      </View>
      <Button
        label="Yeni bildiriş"
        variant="secondary"
        size="md"
        onPress={() => setUnread((n) => n + 1)}
      />
    </View>
  );
}
