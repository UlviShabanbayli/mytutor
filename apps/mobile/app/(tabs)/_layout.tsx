import { Tabs } from 'expo-router/js-tabs';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AskTabButton } from '@/components/navigation/AskTabButton';
import { Icon, type IconName, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/theme';

const TAB_BAR_HEIGHT = 68;

/** Honey icon for the active tab, muted otherwise. */
function tabIcon(name: IconName) {
  return function TabIcon({ focused }: { focused: boolean }) {
    return <Icon name={name} size={24} color={focused ? 'honey-text' : 'muted'} />;
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
        tabBarActiveTintColor: colors.honey,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabel: ({ focused, children }) => (
          <Text
            numberOfLines={1}
            tone={focused ? 'honey' : 'muted'}
            className={cn(
              'text-center text-[11px]',
              focused ? 'font-sans-black' : 'font-sans-medium',
            )}
          >
            {children}
          </Text>
        ),
        // Tall enough for the round Ask button (design: 84pt bar including the home indicator).
        tabBarStyle: {
          backgroundColor: colors.surf,
          borderTopColor: colors.border,
          height: TAB_BAR_HEIGHT + insets.bottom,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.home'), tabBarIcon: tabIcon('today') }} />
      <Tabs.Screen
        name="tests"
        options={{
          title: t('tabs.tests'),
          tabBarIcon: tabIcon('learn'),
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
          tabBarIcon: tabIcon('play'),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: t('tabs.progress'),
          tabBarIcon: tabIcon('chart'),
        }}
      />
    </Tabs>
  );
}
