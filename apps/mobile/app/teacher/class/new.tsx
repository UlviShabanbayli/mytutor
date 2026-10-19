import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClassTypePicker } from '@/components/teacher/ClassTypePicker';
import { GradePicker } from '@/components/teacher/GradePicker';
import { InviteCodeCard } from '@/components/teacher/InviteCodeCard';
import { SubjectField, type SubjectKey } from '@/components/teacher/SubjectField';
import { TeacherHeader } from '@/components/teacher/TeacherHeader';
import { TeacherScreen } from '@/components/teacher/TeacherScreen';
import { Banner, Button, Input } from '@/components/ui';
import { useCreateClass, useTeacherProfile } from '@/features/teacher/queries';
import type { TeacherClass } from '@/features/teacher/types';

/** New class and its invite code (design t-class-new, M2): a free class opens at once. */
export default function NewClassScreen() {
  const { t } = useTranslation();
  const profile = useTeacherProfile();
  const create = useCreateClass();
  const [subject, setSubject] = useState<SubjectKey>('math');
  const [grade, setGrade] = useState(7);
  const [name, setName] = useState('');
  const [paid, setPaid] = useState(false);
  const [showError, setShowError] = useState(false);
  const [created, setCreated] = useState<TeacherClass | null>(null);
  const nameError = name.trim().length < 2 ? t('teacher.classNew.nameError') : undefined;

  const submit = () => {
    if (nameError) {
      setShowError(true);
      return;
    }
    create.mutate(
      { subject: t(`teacher.subjects.${subject}`), grade, name },
      { onSuccess: setCreated },
    );
  };

  return (
    <TeacherScreen
      header={
        <TeacherHeader
          title={t('teacher.classNew.title')}
          subtitle={t('teacher.classNew.subtitle')}
        />
      }
      contentClassName="gap-3.5"
    >
      <SubjectField value={subject} onChange={setSubject} />
      <GradePicker value={grade} onChange={setGrade} />
      <Input
        label={t('teacher.classNew.name')}
        placeholder={t('teacher.classNew.namePlaceholder')}
        value={name}
        onChangeText={(v) => {
          setName(v);
          setShowError(false);
        }}
        error={showError ? nameError : undefined}
        returnKeyType="done"
        onSubmitEditing={submit}
        editable={created === null}
      />
      <ClassTypePicker
        paid={paid}
        onChange={setPaid}
        verified={profile.data?.verification === 'verified'}
      />
      {create.isError ? <Banner kind="error" message={t('common.errorDescription')} /> : null}
      {created ? (
        <>
          <InviteCodeCard cls={created} />
          <Button
            variant="secondary"
            label={t('teacher.classNew.openClass')}
            onPress={() =>
              router.replace({ pathname: '/teacher/class/[id]', params: { id: created.id } })
            }
          />
        </>
      ) : (
        <Button label={t('teacher.classNew.submit')} loading={create.isPending} onPress={submit} />
      )}
    </TeacherScreen>
  );
}
