import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChildGate } from '@/components/parent/ChildGate';
import { ChildReport } from '@/components/parent/ChildReport';
import { ParentStackHeader } from '@/components/parent/ParentStackHeader';
import { Screen } from '@/components/ui';
import { useChildren } from '@/features/parent/queries';

/** The weekly report of one child (architecture V2). */
export default function ParentReportScreen() {
  const { t } = useTranslation();
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const child = useChildren().data?.find((c) => c.childId === childId);

  return (
    <Screen>
      <ParentStackHeader
        title={t('parent.report.title')}
        subtitle={
          child
            ? t('parent.report.subtitle', {
                name: child.name,
                grade: t('common.grade', { count: child.grade, ordinal: true }),
              })
            : undefined
        }
      />
      <ChildGate childId={childId} category="report">
        {(found) => <ChildReport child={found} />}
      </ChildGate>
    </Screen>
  );
}
