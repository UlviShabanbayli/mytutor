import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GroupFilter } from '@/components/teacher/GroupFilter';
import { InvitePanel } from '@/components/teacher/InvitePanel';
import { MemberList } from '@/components/teacher/MemberList';
import { NameSheet } from '@/components/teacher/NameSheet';
import { NoteLine } from '@/components/teacher/NoteLine';
import { SearchField } from '@/components/teacher/SearchField';
import { TeacherHeader } from '@/components/teacher/TeacherHeader';
import { TeacherScreen } from '@/components/teacher/TeacherScreen';
import { ErrorState, LoadingState } from '@/components/ui';
import { useAddGroup, useClassMembers, useTeacherClass } from '@/features/teacher/queries';

/** Members and invites of a class (design t-members, M2). */
export default function ClassMembersScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const cls = useTeacherClass(id);
  const members = useClassMembers(id);
  const addGroup = useAddGroup();
  const [query, setQuery] = useState('');
  const [groupId, setGroupId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const failed = cls.isError || members.isError;

  return (
    <TeacherScreen
      header={
        <TeacherHeader
          title={t('teacher.members.title')}
          subtitle={
            cls.data
              ? t('teacher.members.subtitle', {
                  class: cls.data.name,
                  students: t('teacher.students', {
                    count: members.data?.length ?? cls.data.studentCount,
                  }),
                })
              : undefined
          }
        />
      }
      contentClassName="gap-2.5"
    >
      {failed ? (
        <ErrorState
          onRetry={() => {
            void cls.refetch();
            void members.refetch();
          }}
        />
      ) : !cls.data || !members.data ? (
        <LoadingState />
      ) : (
        <>
          <InvitePanel cls={cls.data} />
          <SearchField value={query} onChangeText={setQuery} label={t('teacher.members.search')} />
          <GroupFilter
            groups={cls.data.groups}
            total={members.data.length}
            value={groupId}
            onChange={setGroupId}
            onAdd={() => setAdding(true)}
          />
          <NoteLine icon="eye">{t('teacher.members.privacy')}</NoteLine>
          <MemberList cls={cls.data} members={members.data} query={query} groupId={groupId} />
          <NameSheet
            visible={adding}
            title={t('teacher.members.groupSheet')}
            label={t('teacher.members.groupName')}
            placeholder={t('teacher.members.groupPlaceholder')}
            errorText={t('teacher.members.groupError')}
            submitLabel={t('teacher.members.groupSubmit')}
            loading={addGroup.isPending}
            onClose={() => setAdding(false)}
            onSubmit={(name, done) => addGroup.mutate({ classId: id, name }, { onSuccess: done })}
          />
        </>
      )}
    </TeacherScreen>
  );
}
