import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ClassCard } from '@/components/teacher/ClassCard';
import { NoticesButton } from '@/components/teacher/NoticesButton';
import { SectionHeading } from '@/components/teacher/SectionHeading';
import { SmallButton } from '@/components/teacher/SmallButton';
import { TeacherScreen } from '@/components/teacher/TeacherScreen';
import { TeacherTabHeader } from '@/components/teacher/TeacherTabHeader';
import { TodaySection } from '@/components/teacher/TodaySection';
import { VerifyBanner } from '@/components/teacher/VerifyBanner';
import { EmptyState, ErrorState, LoadingState, Text } from '@/components/ui';
import { useTeacherClasses, useTeacherProfile } from '@/features/teacher/queries';

/** Teacher home (design t-classes): verification note, my classes, today's work. */
export default function TeacherClassesScreen() {
  const { t } = useTranslation();
  const profile = useTeacherProfile();
  const classes = useTeacherClasses();
  const openNew = () => router.push('/teacher/class/new');
  const students = classes.data?.reduce((sum, c) => sum + c.studentCount, 0) ?? 0;

  return (
    <TeacherScreen
      header={<TeacherTabHeader title={t('teacher.classes.title')} action={<NoticesButton />} />}
    >
      {profile.data ? <VerifyBanner status={profile.data.verification} /> : null}
      {classes.isPending ? (
        <LoadingState />
      ) : classes.isError ? (
        <ErrorState onRetry={() => void classes.refetch()} />
      ) : classes.data.length === 0 ? (
        <EmptyState
          moment="greeting"
          title={t('teacher.classes.emptyTitle')}
          description={t('teacher.classes.emptyBody')}
          actionLabel={t('teacher.classNew.submit')}
          onAction={openNew}
        />
      ) : (
        <>
          <View className="flex-row items-center gap-2">
            <View className="flex-1 gap-px">
              <SectionHeading>{t('teacher.classes.mine')}</SectionHeading>
              <Text className="font-sans-bold text-xs text-muted">
                {t('teacher.classes.summary', {
                  classes: t('teacher.classCount', { count: classes.data.length }),
                  students: t('teacher.students', { count: students }),
                })}
              </Text>
            </View>
            <SmallButton icon="plus" label={t('teacher.classes.open')} onPress={openNew} />
          </View>
          {classes.data.map((c) => (
            <ClassCard key={c.id} cls={c} />
          ))}
          <TodaySection />
        </>
      )}
    </TeacherScreen>
  );
}
