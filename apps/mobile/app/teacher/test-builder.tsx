import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { TeacherHeader } from '@/components/teacher/TeacherHeader';
import { TeacherScreen } from '@/components/teacher/TeacherScreen';
import { TestBuilder } from '@/components/teacher/TestBuilder';
import { ErrorState, LoadingState } from '@/components/ui';
import { useTestDraft, useUnit } from '@/features/teacher/queries';
import { estimateMinutes } from '@/features/teacher/testBuilder';

/** Test builder (design t-test-builder): `draft` opens a saved draft, `topic` a topic's bank. */
export default function TestBuilderScreen() {
  const { t } = useTranslation();
  const { draft, topic } = useLocalSearchParams<{ draft?: string; topic?: string }>();
  const unit = useUnit();
  const start = useTestDraft(draft);
  const header = (count: number) => (
    <TeacherHeader
      title={t('teacher.builder.title')}
      subtitle={t('teacher.builder.subtitle', { count, minutes: estimateMinutes(count) })}
    />
  );

  if (unit.isError || start.isError)
    return (
      <TeacherScreen header={header(0)}>
        <ErrorState onRetry={() => void start.refetch()} />
      </TeacherScreen>
    );
  if (!unit.data || !start.data)
    return (
      <TeacherScreen header={header(0)}>
        <LoadingState />
      </TeacherScreen>
    );
  const topicIds = unit.data.topics.map((x) => x.id);
  const topicId = topic && topicIds.includes(topic) ? topic : start.data.topicId;
  return (
    <TestBuilder header={header} topics={unit.data.topics} initial={{ ...start.data, topicId }} />
  );
}
