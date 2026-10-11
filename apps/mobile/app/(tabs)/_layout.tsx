import { Tabs } from 'expo-router/js-tabs';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AskTabButton } from '@/components/navigation/AskTabButton';
import { Icon, type IconName } from '@/components/ui';
import { fontFamily, useThemeColors } from '@/theme';

const TAB_BAR_HEIGHT = 68;

/** Filled icon for the active tab, outline otherwise. */
function tabIcon(active: IconName, inactive: IconName) {
  return function TabIcon({ focused }: { focused: boolean }) {
    return (
      <Icon
        name={focused ? active : inactive}
        size={24}
        color={focused ? 'primary' : 'muted-foreground'}
      />
    );
  };
}

// Five tabs with "Ask" as the raised action in the middle (design A1).
export default function TabsLayout() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors['muted-foreground'],
        tabBarLabelStyle: { fontFamily: fontFamily.bold, fontSize: 11 },
        // Tall enough for the round Ask button (design: 84pt bar including the home indicator).
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: TAB_BAR_HEIGHT + insets.bottom,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t('tabs.home'), tabBarIcon: tabIcon('home', 'home-outline') }}
      />
      <Tabs.Screen
        name="tests"
        options={{
          title: t('tabs.tests'),
          tabBarIcon: tabIcon('clipboard', 'clipboard-outline'),
        }}
      />
      <Tabs.Screen
        name="ask"
        options={{
          title: t('tabs.ask'),
          tabBarButton: (props) => <AskTabButton {...props} label={t('tabs.ask')} />,
        }}
      />
      <Tabs.Screen
        name="lessons"
        options={{
          title: t('tabs.lessons'),
          tabBarIcon: tabIcon('play-circle', 'play-circle-outline'),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: t('tabs.progress'),
          tabBarIcon: tabIcon('stats-chart', 'stats-chart-outline'),
        }}
      />
    </Tabs>
  );
}
