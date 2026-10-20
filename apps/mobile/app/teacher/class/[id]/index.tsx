import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AnnounceSheet } from '@/components/teacher/AnnounceSheet';
import {
  AnnouncementsPanel,
  type PostedAnnouncement,
} from '@/components/teacher/AnnouncementsPanel';
import { ClassAssignments } from '@/components/teacher/ClassAssignments';
import { ClassChatRow } from '@/components/teacher/ClassChatRow';
import { ClassLivePanel } from '@/components/teacher/ClassLivePanel';
import { StatTile } from '@/components/teacher/StatTile';
import { SurfaceTabs } from '@/components/teacher/SurfaceTabs';
import { TeacherHeader } from '@/components/teacher/TeacherHeader';
import { TeacherScreen } from '@/components/teacher/TeacherScreen';
import { Button, ErrorState, LoadingState } from '@/components/ui';
import { useClassMembers, useTeacherClass } from '@/features/teacher/queries';

type Section = 'assignments' | 'members' | 'announcements' | 'live';

/** One class (design t-class, M2/M4): counts, sections, chat switch, assignments. */
export default function TeacherClassScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const cls = useTeacherClass(id);
  const members = useClassMembers(id);
  const [section, setSection] = useState<Section>('assignments');
  const [announcing, setAnnouncing] = useState(false);
  // Posted on this screen only: the shared demo events have no announcement yet.
  const [posted, setPosted] = useState<PostedAnnouncement[]>([]);

  if (cls.isPending)
    return (
      <TeacherScreen header={<TeacherHeader title="" />}>
        <LoadingState />
      </TeacherScreen>
    );
  if (cls.isError)
    return (
      <TeacherScreen header={<TeacherHeader title={t('common.errorTitle')} />}>
        <ErrorState onRetry={() => void cls.refetch()} />
      </TeacherScreen>
    );
  const c = cls.data;
  const muted = members.data?.filter((m) => m.mutedInChat).length ?? 0;
  const tabs = [
    { value: 'assignments', label: t('teacher.class.tabAssignments') },
    { value: 'members', label: t('teacher.class.tabMembers') },
    { value: 'announcements', label: t('teacher.class.tabAnnouncements') },
    { value: 'live', label: t('teacher.class.tabLive') },
  ] as const;

  return (
    <TeacherScreen
      header={
        <TeacherHeader
          title={c.name}
          subtitle={t('teacher.class.subtitle', {
            book: c.book,
            type: c.paid ? t('teacher.paid') : t('teacher.free'),
            code: c.joinCode,
          })}
        />
      }
      footerStyle="bar"
      footer={
        <View className="flex-row gap-2.5">
          <Button
            variant="secondary"
            icon="edit"
            label={t('teacher.class.announce')}
            onPress={() => setAnnouncing(true)}
            className="flex-1"
          />
          <Button
            icon="plus"
            label={t('teacher.class.assign')}
            onPress={() => router.push({ pathname: '/teacher/assign', params: { classId: c.id } })}
            className="flex-[1.4]"
          />
        </View>
      }
    >
      <View className="flex-row gap-2">
        <StatTile value={String(c.studentCount)} label={t('teacher.class.statStudents')} />
        <StatTile value={String(c.activeAssignments)} label={t('teacher.class.statAssignments')} />
        <StatTile
          value={`${Math.round(c.completion * 100)}%`}
          label={t('teacher.class.statCompletion')}
          accessibilityHint={t('teacher.class.report')}
          onPress={() =>
            router.push({ pathname: '/teacher/insights/[classId]', params: { classId: c.id } })
          }
        />
      </View>
      <SurfaceTabs
        tabs={tabs}
        value={section}
        accessibilityLabel={t('teacher.class.sections')}
        onChange={(v) =>
          v === 'members'
            ? router.push({ pathname: '/teacher/class/[id]/members', params: { id: c.id } })
            : setSection(v)
        }
      />
      <ClassChatRow cls={c} mutedCount={muted} />
      {section === 'assignments' ? <ClassAssignments cls={c} /> : null}
      {section === 'announcements' ? <AnnouncementsPanel classId={c.id} posted={posted} /> : null}
      {section === 'live' ? <ClassLivePanel classId={c.id} /> : null}
      <AnnounceSheet
        visible={announcing}
        onClose={() => setAnnouncing(false)}
        onPosted={(item) => {
          setPosted((list) => [item, ...list]);
          setSection('announcements');
        }}
      />
    </TeacherScreen>
  );
}
