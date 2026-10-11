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
  // The current question counts as done once its answer has been checked.
  const done = useTestSessionStore((s) =>
    s.session ? s.session.index + (s.session.checked ? 1 : 0) : 0,
  );
  if (!test.data) return null;
  const total = test.data.questions.length;
  const progress = t('home.continueProgress', { done, total });

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
          <ProgressBar
            value={total ? done / total : 0}
            accessibilityLabel={progress}
            className="bg-secondary"
          />
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
