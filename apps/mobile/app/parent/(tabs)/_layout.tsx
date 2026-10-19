import { Tabs } from 'expo-router/js-tabs';
import { useTranslation } from 'react-i18next';
import { RoleTabBar } from '@/components/navigation/RoleTabBar';

/** Parent menu (design): Uşaqlarım, Mesajlar, Mən. Parents only watch; nothing here edits. */
export default function ParentTabsLayout() {
  const { t } = useTranslation();
  const items = [
    { name: 'kids', label: t('tabs.kids'), icon: 'users' },
    { name: 'messages', label: t('tabs.messages'), icon: 'mail' },
    { name: 'me', label: t('tabs.me'), icon: 'me' },
  ] as const;

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => (
        <RoleTabBar {...props} items={[...items]} menuLabel={t('tabs.menuParent')} />
      )}
    >
      {items.map((item) => (
        <Tabs.Screen key={item.name} name={item.name} options={{ title: item.label }} />
      ))}
    </Tabs>
  );
}
