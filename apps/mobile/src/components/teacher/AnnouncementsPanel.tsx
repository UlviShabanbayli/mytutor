import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card, ErrorState, LoadingState, Text } from '@/components/ui';
import { useAnnouncements } from '@/features/teacher/queries';
import { useTeacherFormat } from '@/features/teacher/useTeacherFormat';

/** An announcement the teacher posted on this screen (not kept: no demo event has it yet). */
export type PostedAnnouncement = { id: string; text: string; at: string };

type AnnouncementsPanelProps = { classId: string; posted: PostedAnnouncement[] };

/** The class's announcements, newest first. */
export function AnnouncementsPanel({ classId, posted }: AnnouncementsPanelProps) {
  const { t } = useTranslation();
  const f = useTeacherFormat();
  const list = useAnnouncements(classId);

  if (list.isPending) return <LoadingState />;
  if (list.isError) return <ErrorState onRetry={() => void list.refetch()} />;
  const all = [...posted, ...list.data];
  if (all.length === 0) return <Text tone="muted">{t('teacher.class.emptyAnnouncements')}</Text>;
  return (
    <View className="gap-2">
      {all.map((a) => (
        <Card key={a.id} className="gap-1 rounded-lg p-3">
          <Text>{a.text}</Text>
          <Text variant="caption" tone="muted">
            {f.dayAt(new Date(a.at))}
          </Text>
        </Card>
      ))}
    </View>
  );
}
