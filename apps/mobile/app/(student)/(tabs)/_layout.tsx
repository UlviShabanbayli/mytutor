import { Tabs } from 'expo-router/js-tabs';
import { useTranslation } from 'react-i18next';
import { RoleTabBar } from '@/components/navigation/RoleTabBar';
import { useTabMotion } from '@/features/transitions/useTabMotion';

/** Student menu (design TABBAR): Bu gün, Öyrən, Soruş in the middle, İmtahan, Mən. */
export default function StudentTabsLayout() {
  const { t } = useTranslation();
  const tabMotion = useTabMotion();
  const items = [
    { name: 'today', label: t('tabs.today'), icon: 'today' },
    { name: 'learn', label: t('tabs.learn'), icon: 'learn' },
    { name: 'ask', label: t('tabs.ask'), icon: 'ask', center: true, hint: t('tabs.askHint') },
    { name: 'exam', label: t('tabs.exam'), icon: 'exam' },
    { name: 'me', label: t('tabs.me'), icon: 'me' },
  ] as const;

  return (
    <Tabs
      screenOptions={tabMotion}
      tabBar={(props) => (
        <RoleTabBar {...props} items={[...items]} menuLabel={t('tabs.menuStudent')} />
      )}
    >
      {items.map((item) => (
        <Tabs.Screen key={item.name} name={item.name} options={{ title: item.label }} />
      ))}
    </Tabs>
  );
}
