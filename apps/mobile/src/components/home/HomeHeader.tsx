import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Avatar, Icon, Text } from '@/components/ui';
import { streakDays } from '@/features/tests/progress';
import { useTestSessionStore } from '@/features/tests/sessionStore';

/** Greeting with the student's initial and, once there is one, their day streak. */
export function HomeHeader() {
  const { t } = useTranslation();
  const results = useTestSessionStore((s) => s.results);
  const streak = streakDays(results);
  const name = t('progress.guestName');

  return (
    <View className="flex-row items-center gap-3">
      <Avatar name={name} />
      <View className="flex-1">
        <Text variant="label" tone="muted">
          {t('home.greeting')}
        </Text>
        <Text variant="heading" accessibilityRole="header">
          {name}
        </Text>
      </View>
      {streak > 0 ? (
        <View
          accessible
          accessibilityLabel={t('home.streak', { count: streak })}
          className="min-h-9 flex-row items-center gap-1.5 rounded-full border border-border bg-surf px-3"
        >
          <Icon name="bolt" size={16} color="honey-text" />
          <Text className="font-sans-black text-sm">{streak}</Text>
        </View>
      ) : null}
    </View>
  );
}
