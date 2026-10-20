import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge, Icon, PressableCard, Text } from '@/components/ui';
import { dayMonth, mockTitle, subjectName } from '@/features/exam/labels';
import type { MockAttempt } from '@/features/exam/mockRunStore';
import type { MockListItem } from '@/features/exam/types';
import { HexTile } from './HexTile';

type MockRowProps = {
  item: MockListItem;
  /** The student's latest attempt on this device, newer than the demo history. */
  attempt: MockAttempt | undefined;
  onPress: () => void;
};

/** A self-paced mock: new, running, done with its result, or a subject still in preparation. */
export function MockRow({ item, attempt, onPress }: MockRowProps) {
  const { t } = useTranslation();

  if (item.preparing) {
    const title = subjectName(t, item.subject);
    const meta = t('exam.mocks.metaPreparing');
    const tag = t('exam.mocks.tagPreparing');
    return (
      <View
        accessible
        accessibilityLabel={t('exam.mocks.rowA11y', { title, meta, tag })}
        accessibilityState={{ disabled: true }}
        className="min-h-[58px] flex-row items-center gap-3 rounded-lg border border-dashed border-border px-3 py-2"
      >
        <HexTile
          tone="empty"
          size={40}
          icon={(ink) => <Icon name="clock" size={18} color={ink} />}
        />
        <View className="min-w-0 flex-1">
          <Text className="font-sans-black text-base text-lock-ink">{title}</Text>
          <Text className="text-xs text-lock-ink">{meta}</Text>
        </View>
        <Badge tone="neutral" label={tag} className="self-center" />
      </View>
    );
  }

  const title = mockTitle(t, { kind: 'self', subject: item.subject, number: item.number });
  const questions = t('common.questionsCount', { count: item.questionCount });
  const running = attempt !== undefined && attempt.finishedAt === null;
  const finished = attempt?.finishedAt != null ? attempt : null;
  const percent = finished?.percent ?? item.lastPercent;
  const date = finished?.finishedAt != null ? new Date(finished.finishedAt) : item.lastDate;
  const done = !running && percent !== null && date !== null;

  const meta = running
    ? t('exam.mocks.metaRunning', { questions })
    : done
      ? t('exam.mocks.metaDone', { questions, date: dayMonth(t, date) })
      : t('exam.mocks.metaNew', { questions });
  const tag = running
    ? t('exam.mocks.tagRunning')
    : done
      ? t('exam.mocks.tagDone', { percent })
      : t('exam.mocks.tagNew');

  return (
    <PressableCard
      accessibilityLabel={t('exam.mocks.rowA11y', { title, meta, tag })}
      onPress={onPress}
      contentClassName="min-h-[62px] flex-row items-center gap-3 px-3 py-2"
    >
      <HexTile tone="raised" size={40} icon={(ink) => <Icon name="file" size={18} color={ink} />} />
      <View className="min-w-0 flex-1">
        <Text className="font-sans-black text-base">{title}</Text>
        <Text tone="muted" className="text-xs">
          {meta}
        </Text>
      </View>
      <Badge tone={done ? 'ok' : 'honey'} label={tag} className="self-center" />
    </PressableCard>
  );
}
