import { router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Banner, Button } from '@/components/ui';
import type { AssignmentKind, Audience, RosterEntry } from '@mytutor/types';
import { useCreateAssignment } from '@/features/teacher/mutations';
import { useBank } from '@/features/teacher/queries';
import { dueAtOffset } from '@/features/teacher/time';
import type { TeacherClass, UnitView } from '@/features/teacher/types';
import { AssignOptions, type AssignSettings } from './AssignOptions';
import { AssignTopicSection } from './AssignTopicSection';
import { AudiencePicker } from './AudiencePicker';
import { DueField } from './DueField';
import { UNIT_TEST } from './HexTopicPicker';
import { NoteLine } from './NoteLine';
import { Overline } from './Overline';
import { SurfaceTabs } from './SurfaceTabs';
import { TeacherScreen } from './TeacherScreen';

type AssignFormProps = {
  header: ReactNode;
  cls: TeacherClass;
  members: RosterEntry[];
  unit: UnitView;
  initial: { kind: AssignmentKind; topic: string; audience: Audience };
};

const KINDS = ['lesson', 'test', 'homework', 'mock'] as const;

/** "Tapşırıq ver" (M4): kind, topic, audience, due date, test settings, reminder. */
export function AssignForm({ header, cls, members, unit, initial }: AssignFormProps) {
  const { t } = useTranslation();
  const create = useCreateAssignment();
  const [kind, setKind] = useState<AssignmentKind>(initial.kind);
  const [topic, setTopic] = useState(initial.kind === 'mock' ? UNIT_TEST : initial.topic);
  const [audience, setAudience] = useState<Audience>(initial.audience);
  const [due, setDue] = useState(() => dueAtOffset(1));
  const [settings, setSettings] = useState<AssignSettings>({
    attempts: 2,
    minutes: 20,
    reminder: true,
  });
  const firstTopic = unit.topics[0]?.id ?? '';
  const topicId = topic === UNIT_TEST ? firstTopic : topic;
  const bank = useBank(topicId);
  const notes = {
    homework: t('teacher.assign.noteHomework'),
    lesson: t('teacher.assign.noteLesson'),
    test: t('teacher.assign.noteTest'),
    mock: t('teacher.assign.noteTest'),
  };

  // The unit-test cell and the "Sınaq" kind are one choice seen from two places.
  const changeKind = (k: AssignmentKind) => {
    setKind(k);
    if (k === 'mock') setTopic(UNIT_TEST);
    else if (topic === UNIT_TEST) setTopic(firstTopic);
  };
  const changeTopic = (value: string) => {
    setTopic(value);
    if (value === UNIT_TEST) setKind('mock');
    else if (kind === 'mock') setKind('test');
  };
  const submit = () =>
    create.mutate(
      { classId: cls.id, kind, topicId, audience, dueAt: due.toISOString() },
      {
        onSuccess: () => (router.canGoBack() ? router.back() : router.replace('/teacher/classes')),
      },
    );

  return (
    <TeacherScreen
      header={header}
      contentClassName="gap-3.5"
      footer={
        <>
          <NoteLine icon="check">{notes[kind]}</NoteLine>
          <Button label={t('teacher.assign.submit')} loading={create.isPending} onPress={submit} />
        </>
      }
    >
      <View className="gap-1.5">
        <Overline>{t('teacher.assign.kind')}</Overline>
        <SurfaceTabs
          role="radio"
          tabs={KINDS.map((k) => ({ value: k, label: t(`teacher.kinds.${k}`) }))}
          value={kind}
          onChange={changeKind}
          accessibilityLabel={t('teacher.assign.kind')}
        />
      </View>
      <AssignTopicSection unit={unit} value={topic} onChange={changeTopic} />
      <AudiencePicker cls={cls} members={members} value={audience} onChange={setAudience} />
      <DueField value={due} onChange={setDue} />
      <AssignOptions
        value={settings}
        onChange={setSettings}
        isTest={kind === 'test' || kind === 'mock'}
        questionCount={bank.data?.length ?? 0}
        topicId={topicId}
        topicNumber={unit.topics.find((x) => x.id === topicId)?.number ?? ''}
      />
      {create.isError ? <Banner kind="error" message={t('common.errorDescription')} /> : null}
    </TeacherScreen>
  );
}
