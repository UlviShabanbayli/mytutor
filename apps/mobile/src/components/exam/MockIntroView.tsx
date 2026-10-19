import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Mascot } from '@/components/mascot/Mascot';
import { Badge, Button, Icon, IconButton, Text } from '@/components/ui';
import { mockTitle } from '@/features/exam/labels';
import { mockRunHref } from '@/features/exam/links';
import { useMockRunStore } from '@/features/exam/mockRunStore';
import { formatClock, remainingMs } from '@/features/exam/mockTimer';
import type { MockExam } from '@/features/exam/types';
import { useExamState } from '@/features/exam/useExamState';
import { useNow } from '@/features/exam/useNow';
import { MockRulesList } from './MockRulesList';

type MockIntroViewProps = {
  mock: MockExam;
};

const leave = () => (router.canGoBack() ? router.back() : router.replace('/exam/mocks'));

/** The rules before a mock; "Başla" starts the clock (or "Davam et" returns to a running one). */
export function MockIntroView({ mock }: MockIntroViewProps) {
  const { t } = useTranslation();
  const { offline } = useExamState();
  const attempt = useMockRunStore((s) => s.attempts[mock.id]);
  const start = useMockRunStore((s) => s.start);
  const now = useNow();
  const running = attempt !== undefined && attempt.finishedAt === null;
  // A rated general mock starts online only; a self-paced one and a running one work offline.
  const blocked = offline && mock.kind === 'scheduled' && !running;

  return (
    <View className="flex-1 gap-2.5">
      <View className="-ml-3 flex-row items-center gap-1">
        <IconButton icon="close" accessibilityLabel={t('common.close')} onPress={leave} />
        <Text variant="overline" tone="muted" className="text-xs">
          {t('exam.intro.label')}
        </Text>
      </View>
      <View className="items-center gap-1.5">
        <Mascot moment="focus" size={92} decorative />
        <Text variant="heading" className="text-center font-display-black text-xl">
          {mockTitle(t, mock)}
        </Text>
        <View className="flex-row flex-wrap justify-center gap-1.5">
          <Badge
            tone="honey"
            label={t('common.questionsCount', { count: mock.questions.length })}
          />
          <Badge tone="honey" label={t('exam.intro.chipOptions')} />
          <Badge tone="honey" label={t('exam.intro.chipTime')} />
        </View>
      </View>
      <MockRulesList />
      <View accessibilityRole="summary" className="flex-row items-center justify-center gap-1.5">
        <Icon name={offline ? 'offline' : 'check'} size={16} color={offline ? 'info' : 'ok'} />
        <Text
          className={
            offline ? 'font-sans-bold text-sm text-info' : 'font-sans-bold text-sm text-ok'
          }
        >
          {running
            ? t('exam.intro.running', {
                time: formatClock(remainingMs(attempt.startedAt, mock.durationMinutes, now)),
              })
            : offline
              ? t('exam.intro.offline')
              : t('exam.intro.online')}
        </Text>
      </View>
      <View className="min-h-2 flex-1" />
      <View className="gap-1">
        <Button
          label={running ? t('exam.intro.resume') : t('exam.intro.start')}
          disabled={blocked}
          onPress={() => {
            start(mock.id, Date.now());
            router.replace(mockRunHref(mock.id));
          }}
        />
        <Button variant="text" size="md" label={t('exam.intro.notReady')} onPress={leave} />
      </View>
    </View>
  );
}
