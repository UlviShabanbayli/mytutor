import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChildGate } from '@/components/parent/ChildGate';
import { ParentStackHeader } from '@/components/parent/ParentStackHeader';
import { QueryView } from '@/components/parent/QueryView';
import { SubjectProgressView } from '@/components/parent/SubjectProgressView';
import { EmptyState, Screen, SegmentedControl } from '@/components/ui';
import { useChildren, useChildSubjects } from '@/features/parent/queries';

/** A child's progress by subject: the frames and cells of each textbook (architecture V2). */
export default function ParentSubjectScreen() {
  const { t } = useTranslation();
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const child = useChildren().data?.find((c) => c.childId === childId);
  const subjects = useChildSubjects(childId);
  const [picked, setPicked] = useState<string | null>(null);
  const list = subjects.data ?? [];
  const subject = list.find((s) => s.subjectId === picked) ?? list[0];

  return (
    <Screen>
      <ParentStackHeader
        title={subject?.title ?? t('parent.subject.fallbackTitle')}
        subtitle={
          child && subject
            ? t('parent.subject.subtitle', { name: child.name, book: subject.book })
            : child?.name
        }
      />
      <ChildGate childId={childId} category="progress">
        {(found) => (
          <QueryView query={subjects}>
            {(all) =>
              subject ? (
                <>
                  {all.length > 1 ? (
                    <SegmentedControl
                      segments={all.map((s) => ({ value: s.subjectId, label: s.title }))}
                      value={subject.subjectId}
                      onChange={setPicked}
                      accessibilityLabel={t('parent.subject.subjectPicker')}
                    />
                  ) : null}
                  <SubjectProgressView child={found} subject={subject} />
                </>
              ) : (
                <EmptyState
                  moment="aiThinking"
                  title={t('parent.subject.emptyTitle')}
                  description={t('parent.subject.emptyBody')}
                />
              )
            }
          </QueryView>
        )}
      </ChildGate>
    </Screen>
  );
}
