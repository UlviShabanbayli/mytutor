import { useState } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import type { SubjectId } from '@mytutor/types';
import { BioField } from '@/components/onboarding/BioField';
import { InfoNote } from '@/components/onboarding/InfoNote';
import { StepScreen } from '@/components/onboarding/StepScreen';
import { StepTitle } from '@/components/onboarding/StepTitle';
import { TeacherGrades } from '@/components/onboarding/TeacherGrades';
import { TeacherSubjects } from '@/components/onboarding/TeacherSubjects';
import { Button } from '@/components/ui';
import { useAppStore } from '@/features/app/appStore';
import { ROLE_HOME } from '@/features/app/roleHome';
import { useOnboardingStore } from '@/features/onboarding/store';

/**
 * The teacher's first step after the account (architecture M1): subjects, grades and a short
 * bio, then straight to opening a free class. Verification comes later and only for paid work.
 */
export default function OnboardingTeacherScreen() {
  const { t } = useTranslation();
  const draft = useOnboardingStore((s) => s.teacher);
  const setTeacher = useOnboardingStore((s) => s.setTeacher);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const [subjects, setSubjects] = useState<SubjectId[]>(draft.subjects);
  const [grades, setGrades] = useState<number[]>(draft.grades);
  const [bio, setBio] = useState(draft.bio);
  const ready = subjects.length > 0 && grades.length > 0;

  const createClass = () => {
    setTeacher({ subjects, grades, bio: bio.trim() });
    completeOnboarding();
    router.replace(ROLE_HOME.teacher);
    router.push('/teacher/class/new');
  };

  return (
    <StepScreen
      step="teacher"
      contentClassName="gap-3.5"
      footer={
        <Button
          label={t('onboarding.teacherStart.submit')}
          icon="plus"
          disabled={!ready}
          onPress={createClass}
        />
      }
    >
      <StepTitle
        title={t('onboarding.teacherStart.title')}
        subtitle={t('onboarding.teacherStart.subtitle')}
      />
      <TeacherSubjects value={subjects} onChange={setSubjects} />
      <TeacherGrades value={grades} onChange={setGrades} />
      <BioField value={bio} onChange={setBio} />
      <InfoNote tone="honey" icon="shield" text={t('onboarding.teacherStart.note')} />
    </StepScreen>
  );
}
