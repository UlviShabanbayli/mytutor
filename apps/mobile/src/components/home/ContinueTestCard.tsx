import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, PressableCard, ProgressBar, Text } from '@/components/ui';
import { useTest } from '@/features/tests/queries';
import { useTestSessionStore } from '@/features/tests/sessionStore';

type ContinueTestCardProps = {
  testId: string;
};

/** A test the student left halfway; tapping it resumes where they stopped. */
function ContinueTest({ testId }: ContinueTestCardProps) {
  const { t } = useTranslation();
  const test = useTest(testId);
  const index = useTestSessionStore((s) => s.session?.index ?? 0);
  if (!test.data) return null;
  const total = test.data.questions.length;
  const progress = t('home.continueProgress', { done: index, total });

  return (
    <View className="gap-2.5">
      <Text variant="subheading" accessibilityRole="header">
        {t('home.continueTitle')}
      </Text>
      <PressableCard
        accessibilityLabel={`${test.data.title}, ${progress}`}
        onPress={() => router.push({ pathname: '/test/[id]', params: { id: testId } })}
        contentClassName="flex-row items-center gap-3.5"
      >
        <View className="h-14 w-14 items-center justify-center rounded-md bg-secondary">
          <Icon name="play" size={22} color="secondary-foreground" />
        </View>
        <View className="flex-1 gap-1.5">
          <Text className="font-sans-black" numberOfLines={1}>
            {test.data.title}
          </Text>
          <ProgressBar value={total ? index / total : 0} accessibilityLabel={progress} />
          <Text variant="caption" tone="muted">
            {progress}
          </Text>
        </View>
      </PressableCard>
    </View>
  );
}

/** Shown only while a test is in progress. */
export function ContinueTestCard() {
  const testId = useTestSessionStore((s) => s.session?.testId);
  return testId ? <ContinueTest testId={testId} /> : null;
}
