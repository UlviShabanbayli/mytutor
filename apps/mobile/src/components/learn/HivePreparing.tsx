import { router } from 'expo-router';
import { EmptyState, Screen, ScreenHeader } from '@/components/ui';
import type { SubjectEntry } from '@/features/learn/types';
import { useLearnText } from '@/features/learn/useLearnText';

type HivePreparingProps = {
  /** The subject when it is known; null for a link to a hive that does not exist yet. */
  subject: SubjectEntry | null;
};

/** A subject whose textbook is not in the app yet: open, calm, "hazırlanır" (product rule 4). */
export function HivePreparing({ subject }: HivePreparingProps) {
  const { t } = useLearnText();
  const name = subject ? t('learn.hiveName', { subject: subject.name, grade: subject.grade }) : '';

  return (
    <Screen>
      <ScreenHeader title={name} />
      <EmptyState
        title={
          subject ? t('learn.hive.preparingTitle', { name }) : t('learn.hive.preparingTitleUnknown')
        }
        description={t('learn.hive.preparingBody')}
        actionLabel={t('learn.hive.preparingAction')}
        onAction={() => router.navigate('/learn')}
      />
    </Screen>
  );
}
