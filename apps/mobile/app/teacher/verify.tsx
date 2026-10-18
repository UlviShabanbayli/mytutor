import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SoonSheet } from '@/components/teacher/SoonSheet';
import { TeacherHeader } from '@/components/teacher/TeacherHeader';
import { TeacherScreen } from '@/components/teacher/TeacherScreen';
import { UnlockList } from '@/components/teacher/UnlockList';
import { VerifyStatusCard } from '@/components/teacher/VerifyStatusCard';
import { type StepState, VerifyStepItem } from '@/components/teacher/VerifyStepItem';
import { ErrorState, Icon, LoadingState, Text } from '@/components/ui';
import { useTeacherProfile } from '@/features/teacher/queries';
import type { VerificationStatus } from '@/features/teacher/types';

/** The three steps and their state for a verification status. */
const STEPS: Record<VerificationStatus, StepState[]> = {
  unverified: ['now', 'todo', 'todo'],
  pending: ['done', 'done', 'now'],
  verified: ['done', 'done', 'done'],
};

/** Teacher verification (design t-verify, M1): documents, review, what it unlocks. */
export default function VerifyScreen() {
  const { t } = useTranslation();
  const profile = useTeacherProfile();
  const [upload, setUpload] = useState(false);
  const header = (
    <TeacherHeader title={t('teacher.verify.title')} subtitle={t('teacher.verify.subtitle')} />
  );

  if (profile.isError)
    return (
      <TeacherScreen header={header}>
        <ErrorState onRetry={() => void profile.refetch()} />
      </TeacherScreen>
    );
  if (!profile.data)
    return (
      <TeacherScreen header={header}>
        <LoadingState />
      </TeacherScreen>
    );
  const status = profile.data.verification;
  const states = STEPS[status];
  const word = (s: StepState, review: boolean) =>
    s === 'done'
      ? review
        ? t('teacher.verify.approved')
        : t('teacher.verify.uploaded')
      : s === 'now' && review
        ? t('teacher.verify.reviewing')
        : t('teacher.verify.waiting');
  const steps = [
    { title: t('teacher.verify.idTitle'), file: t('teacher.verify.idFile') },
    { title: t('teacher.verify.diplomaTitle'), file: t('teacher.verify.diplomaFile') },
    { title: t('teacher.verify.reviewTitle'), file: t('teacher.verify.reviewFile') },
  ];

  return (
    <TeacherScreen header={header}>
      <VerifyStatusCard status={status} submittedAt={profile.data.submittedAt} />
      <View accessibilityLabel={t('teacher.verify.steps')}>
        {steps.map((s, i) => {
          const state = states[i] ?? 'todo';
          return (
            <VerifyStepItem
              key={s.title}
              index={i + 1}
              state={state}
              title={s.title}
              file={s.file}
              status={word(state, i === 2)}
              last={i === steps.length - 1}
              extra={
                i === 1
                  ? { label: t('teacher.verify.extra'), onPress: () => setUpload(true) }
                  : undefined
              }
            />
          );
        })}
      </View>
      <UnlockList unlocked={status === 'verified'} />
      <View className="flex-row items-start gap-2.5 rounded-lg bg-ok-bg px-3 py-2.5">
        <Icon name="shield" size={20} color="ok" />
        <Text variant="caption" className="flex-1 font-sans text-ink">
          {t('teacher.verify.privacyBefore')}
          <Text className="font-sans-black text-sm">{t('teacher.verify.privacyBold')}</Text>
          {t('teacher.verify.privacyAfter')}
        </Text>
      </View>
      <SoonSheet
        content={
          upload
            ? { title: t('teacher.soon.uploadTitle'), body: t('teacher.soon.uploadBody') }
            : null
        }
        onClose={() => setUpload(false)}
      />
    </TeacherScreen>
  );
}
