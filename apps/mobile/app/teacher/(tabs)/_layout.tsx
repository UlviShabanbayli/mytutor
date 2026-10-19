import { Tabs } from 'expo-router/js-tabs';
import { useTranslation } from 'react-i18next';
import { RoleTabBar } from '@/components/navigation/RoleTabBar';

/** Teacher menu (design): Siniflər, Suallar, Yarat in the middle, Mesajlar, Mən. */
export default function TeacherTabsLayout() {
  const { t } = useTranslation();
  const items = [
    { name: 'classes', label: t('tabs.classes'), icon: 'users' },
    { name: 'inbox', label: t('tabs.inbox'), icon: 'chat' },
    {
      name: 'create',
      label: t('tabs.create'),
      icon: 'plus',
      center: true,
      hint: t('tabs.createHint'),
    },
    { name: 'messages', label: t('tabs.messages'), icon: 'mail' },
    { name: 'me', label: t('tabs.me'), icon: 'me' },
  ] as const;

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => (
        <RoleTabBar {...props} items={[...items]} menuLabel={t('tabs.menuTeacher')} />
      )}
    >
      {items.map((item) => (
        <Tabs.Screen key={item.name} name={item.name} options={{ title: item.label }} />
      ))}
    </Tabs>
  );
}
