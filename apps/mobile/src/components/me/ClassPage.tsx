import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, Screen, ScreenHeader, Text } from '@/components/ui';
import { useClassMembership } from '@/features/me/queries';
import { useMeStore } from '@/features/me/store';
import type { ClassFeed, ClassSummary } from '@/features/me/types';
import { AnnouncementCard } from './AnnouncementCard';
import { AssignmentCard } from './AssignmentCard';
import { ClassJar } from './ClassJar';
import { ConfirmSheet } from './ConfirmSheet';
import { InfoSheet } from './InfoSheet';
import { LiveLessonCard } from './LiveLessonCard';
import { MaterialRow } from './MaterialRow';
import { OptionsSheet } from './OptionsSheet';
import { PillTabs } from './PillTabs';
import { RecordingRow } from './RecordingRow';
import { ReportSheet } from './ReportSheet';

type Section = 'feed' | 'assignments' | 'materials' | 'chat';
type SheetKind = 'options' | 'leave' | 'report' | 'recording' | 'file';

type ClassPageProps = { summary: ClassSummary; feed: ClassFeed };

/** A class (architecture Ş10): jar, feed, tasks, materials; the chat opens on its own screen. */
export function ClassPage({ summary, feed }: ClassPageProps) {
  const { t } = useTranslation();
  const [section, setSection] = useState<Section>('feed');
  const [sheet, setSheet] = useState<SheetKind | null>(null);
  const [target, setTarget] = useState<string>(summary.id);
  const reported = useMeStore((s) => s.reported);
  const report = useMeStore((s) => s.report);
  const reminders = useMeStore((s) => s.reminders);
  const toggleReminder = useMeStore((s) => s.toggleReminder);
  const { leave } = useClassMembership();
  const askReport = (id: string) => {
    setTarget(id);
    setSheet('report');
  };
  const next = feed.assignments.find((a) => a.status === 'not_started') ?? feed.assignments[0];
  const feedEmpty = !feed.announcement && !feed.live && !next && !feed.recording;

  return (
    <Screen className="gap-2.5">
      <ScreenHeader
        title={summary.name}
        subtitle={t('me.classes.meta', {
          teacher: summary.teacher,
          students: t('me.shared.studentsCount', { count: summary.students }),
        })}
        actions={
          <IconButton
            icon="more"
            accessibilityLabel={t('me.classPage.options')}
            onPress={() => setSheet('options')}
          />
        }
      />
      <ClassJar jar={summary.jar} />
      <PillTabs
        accessibilityLabel={t('me.classPage.tabsLabel')}
        value={section}
        onChange={(v) =>
          v === 'chat'
            ? router.push({ pathname: '/class/[id]/chat', params: { id: summary.id } })
            : setSection(v)
        }
        options={[
          { value: 'feed', label: t('me.classPage.tabFeed') },
          { value: 'assignments', label: t('me.classPage.tabAssignments') },
          { value: 'materials', label: t('me.classPage.tabMaterials') },
          {
            value: 'chat',
            label: t('me.classPage.tabChat'),
            dotLabel: summary.newMessages > 0 ? t('me.classPage.chatNew') : undefined,
          },
        ]}
      />
      {section === 'feed' ? (
        <>
          {feed.announcement ? (
            <AnnouncementCard
              item={feed.announcement}
              teacher={summary}
              reported={reported.includes(feed.announcement.id)}
              onReport={() => feed.announcement && askReport(feed.announcement.id)}
            />
          ) : null}
          {feed.live ? (
            <LiveLessonCard
              live={feed.live}
              reminded={reminders.includes(feed.live.id)}
              onRemind={() => feed.live && toggleReminder(feed.live.id)}
            />
          ) : null}
          {next ? <AssignmentCard item={next} /> : null}
          {feed.recording ? (
            <RecordingRow item={feed.recording} onPress={() => setSheet('recording')} />
          ) : null}
          {feedEmpty ? <Text tone="muted">{t('me.classPage.feedEmpty')}</Text> : null}
        </>
      ) : null}
      {section === 'assignments' ? (
        feed.assignments.length ? (
          feed.assignments.map((a) => <AssignmentCard key={a.id} item={a} />)
        ) : (
          <Text tone="muted">{t('me.classPage.assignmentsEmpty')}</Text>
        )
      ) : null}
      {section === 'materials' ? (
        feed.materials.length ? (
          feed.materials.map((m) => (
            <MaterialRow
              key={m.id}
              item={m}
              reported={reported.includes(m.id)}
              onOpen={() => setSheet('file')}
              onReport={() => askReport(m.id)}
            />
          ))
        ) : (
          <Text tone="muted">{t('me.classPage.materialsEmpty')}</Text>
        )
      ) : null}

      <OptionsSheet
        visible={sheet === 'options'}
        title={t('me.classPage.options')}
        onClose={() => setSheet(null)}
        options={[
          {
            key: 'report',
            icon: 'report',
            label: t('me.classPage.reportClass'),
            onPress: () => askReport(summary.id),
          },
          {
            key: 'leave',
            icon: 'logout',
            label: t('me.classPage.leave'),
            danger: true,
            onPress: () => setSheet('leave'),
          },
        ]}
      />
      <ConfirmSheet
        visible={sheet === 'leave'}
        title={t('me.classPage.leaveTitle')}
        body={t('me.classPage.leaveBody')}
        confirmLabel={t('me.classPage.leave')}
        danger
        onClose={() => setSheet(null)}
        onConfirm={() => {
          leave(summary.id);
          router.back();
        }}
      />
      <ReportSheet
        visible={sheet === 'report'}
        onClose={() => setSheet(null)}
        onReport={() => report(target)}
      />
      <InfoSheet
        visible={sheet === 'recording'}
        title={t('me.classPage.recordingSoonTitle')}
        paragraphs={[t('me.classPage.recordingSoonBody')]}
        onClose={() => setSheet(null)}
      />
      <InfoSheet
        visible={sheet === 'file'}
        title={t('me.classPage.fileSoonTitle')}
        paragraphs={[t('me.classPage.fileSoonBody')]}
        onClose={() => setSheet(null)}
      />
    </Screen>
  );
}
