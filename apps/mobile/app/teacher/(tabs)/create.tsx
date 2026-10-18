import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MakerTile } from '@/components/teacher/MakerTile';
import { MaterialRow } from '@/components/teacher/MaterialRow';
import { NoteLine } from '@/components/teacher/NoteLine';
import { NoticesButton } from '@/components/teacher/NoticesButton';
import { SectionHeading } from '@/components/teacher/SectionHeading';
import { type SoonContent, SoonSheet } from '@/components/teacher/SoonSheet';
import { TeacherScreen } from '@/components/teacher/TeacherScreen';
import { TeacherTabHeader } from '@/components/teacher/TeacherTabHeader';
import { ErrorState, LoadingState, Text } from '@/components/ui';
import { useMaterials } from '@/features/teacher/queries';

/** Create (design t-create, M3): the four makers, drafts and what went to the catalog. */
export default function TeacherCreateScreen() {
  const { t } = useTranslation();
  const materials = useMaterials();
  const [soon, setSoon] = useState<SoonContent | null>(null);
  const openBuilder = () => router.push('/teacher/test-builder');
  const lessonSoon = { title: t('teacher.soon.lessonTitle'), body: t('teacher.soon.lessonBody') };
  const list = materials.data ?? [];
  const drafts = list.filter((m) => m.state === 'draft');
  const inClasses = list.filter((m) => m.state === 'class');
  const sent = list.filter((m) => m.state === 'in_review' || m.state === 'approved');

  return (
    <TeacherScreen
      header={<TeacherTabHeader title={t('teacher.create.title')} action={<NoticesButton />} />}
      contentClassName="gap-2.5"
    >
      <View className="gap-2.5">
        <View className="flex-row gap-2.5">
          <MakerTile
            icon="book"
            title={t('teacher.create.lesson')}
            body={t('teacher.create.lessonBody')}
            onPress={() => setSoon(lessonSoon)}
          />
          <MakerTile
            icon="video"
            title={t('teacher.create.video')}
            body={t('teacher.create.videoBody')}
            onPress={() =>
              setSoon({ title: t('teacher.soon.videoTitle'), body: t('teacher.soon.videoBody') })
            }
          />
        </View>
        <View className="flex-row gap-2.5">
          <MakerTile
            icon="list"
            title={t('teacher.create.test')}
            body={t('teacher.create.testBody')}
            onPress={openBuilder}
          />
          <MakerTile
            icon="edit"
            title={t('teacher.create.question')}
            body={t('teacher.create.questionBody')}
            onPress={() =>
              setSoon({
                title: t('teacher.soon.questionTitle'),
                body: t('teacher.soon.questionBody'),
              })
            }
          />
        </View>
      </View>
      <NoteLine icon="link">{t('teacher.create.note')}</NoteLine>
      {materials.isPending ? (
        <LoadingState />
      ) : materials.isError ? (
        <ErrorState onRetry={() => void materials.refetch()} />
      ) : (
        <>
          <SectionHeading className="pt-0.5">
            {t('teacher.create.drafts', { count: drafts.length })}
          </SectionHeading>
          {drafts.length === 0 ? <Text tone="muted">{t('teacher.create.noDrafts')}</Text> : null}
          {drafts.map((m) => (
            <MaterialRow
              key={m.id}
              material={m}
              onPress={
                m.kind === 'test'
                  ? () =>
                      router.push({ pathname: '/teacher/test-builder', params: { draft: m.id } })
                  : () => setSoon(lessonSoon)
              }
            />
          ))}
          {inClasses.length > 0 ? (
            <SectionHeading className="pt-0.5">{t('teacher.create.inClasses')}</SectionHeading>
          ) : null}
          {inClasses.map((m) => (
            <MaterialRow key={m.id} material={m} />
          ))}
          <SectionHeading className="pt-0.5">{t('teacher.create.sent')}</SectionHeading>
          {sent.length === 0 ? <Text tone="muted">{t('teacher.create.noSent')}</Text> : null}
          {sent.map((m) => (
            <MaterialRow key={m.id} material={m} />
          ))}
        </>
      )}
      <SoonSheet
        content={soon}
        onClose={() => setSoon(null)}
        action={{ label: t('teacher.soon.testInstead'), onPress: openBuilder }}
      />
    </TeacherScreen>
  );
}
