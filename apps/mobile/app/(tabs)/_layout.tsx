import { Tabs } from 'expo-router/js-tabs';
import { useTranslation } from 'react-i18next';
import { Icon, type IconName } from '@/components/ui';
import { useThemeColors } from '@/theme';

/** Filled icon for the active tab, outline otherwise. */
function tabIcon(active: IconName, inactive: IconName) {
  return function TabIcon({ focused, size }: { focused: boolean; size: number }) {
    return (
      <Icon
        name={focused ? active : inactive}
        size={size}
        color={focused ? 'primary' : 'muted-foreground'}
      />
    );
  };
}

// Tab bar background and border come from the navigation theme set in ThemeProvider.
export default function TabsLayout() {
  const { t } = useTranslation();
  const colors = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors['muted-foreground'],
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t('tabs.home'), tabBarIcon: tabIcon('home', 'home-outline') }}
      />
      <Tabs.Screen
        name="ask"
        options={{ title: t('tabs.ask'), tabBarIcon: tabIcon('camera', 'camera-outline') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: t('tabs.profile'), tabBarIcon: tabIcon('person', 'person-outline') }}
      />
    </Tabs>
  );
}
