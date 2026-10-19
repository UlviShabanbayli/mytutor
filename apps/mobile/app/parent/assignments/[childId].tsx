import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AssignmentsView } from '@/components/parent/AssignmentsView';
import { ChildGate } from '@/components/parent/ChildGate';
import { ParentStackHeader } from '@/components/parent/ParentStackHeader';
import { QueryView } from '@/components/parent/QueryView';
import { Screen } from '@/components/ui';
import { useChildAssignments, useChildren } from '@/features/parent/queries';

/** A child's class assignments as the teacher set and graded them (architecture V2). */
export default function ParentAssignmentsScreen() {
  const { t } = useTranslation();
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const child = useChildren().data?.find((c) => c.childId === childId);
  const assignments = useChildAssignments(childId);
  const classLabel = assignments.data?.classLabel;

  return (
    <Screen>
      <ParentStackHeader
        title={t('parent.assignments.title')}
        subtitle={
          child && classLabel
            ? t('parent.assignments.subtitle', { name: child.name, classLabel })
            : child?.name
        }
      />
      <ChildGate childId={childId} category="assignments">
        {() => (
          <QueryView query={assignments}>
            {(list) => <AssignmentsView items={list?.items ?? []} />}
          </QueryView>
        )}
      </ChildGate>
    </Screen>
  );
}
