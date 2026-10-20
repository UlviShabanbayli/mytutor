import { Tabs } from 'expo-router/js-tabs';
import { useTranslation } from 'react-i18next';
import { RoleTabBar } from '@/components/navigation/RoleTabBar';
import { useTabMotion } from '@/features/transitions/useTabMotion';
import type { TabItem } from '@/components/navigation/TabBarItem';
import { useUnreadMessageCount } from '@/features/parent/queries';

/** Parent menu (design): Uşaqlarım, Mesajlar, Mən. Parents only watch; nothing here edits. */
export default function ParentTabsLayout() {
  const { t } = useTranslation();
  const tabMotion = useTabMotion();
  // Unread teacher messages and class notes (demo data until the parent API exists).
  const unread = useUnreadMessageCount();
  const items: TabItem[] = [
    { name: 'kids', label: t('tabs.kids'), icon: 'users' },
    { name: 'messages', label: t('tabs.messages'), icon: 'mail', badge: unread.data || undefined },
    { name: 'me', label: t('tabs.me'), icon: 'me' },
  ];

  return (
    <Tabs
      screenOptions={tabMotion}
      tabBar={(props) => <RoleTabBar {...props} items={items} menuLabel={t('tabs.menuParent')} />}
    >
      {items.map((item) => (
        <Tabs.Screen key={item.name} name={item.name} options={{ title: item.label }} />
      ))}
    </Tabs>
  );
}
