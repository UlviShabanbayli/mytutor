import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { EmptyState, Text } from '@/components/ui';
import { filterMembers } from '@/features/teacher/classroom';
import { matchesName } from '@/features/teacher/people';
import { useRemoveMember } from '@/features/teacher/queries';
import type { ClassMember, TeacherClass } from '@/features/teacher/types';
import { ConfirmSheet } from './ConfirmSheet';
import { MemberActionsSheet } from './MemberActionsSheet';
import { MemberRow } from './MemberRow';

type MemberListProps = {
  cls: TeacherClass;
  members: ClassMember[];
  query: string;
  groupId: string | null;
};

/** The class's students for a search and group filter, with each student's menu. */
export function MemberList({ cls, members, query, groupId }: MemberListProps) {
  const { t } = useTranslation();
  const remove = useRemoveMember();
  const [menuFor, setMenuFor] = useState<ClassMember | null>(null);
  const [removing, setRemoving] = useState<ClassMember | null>(null);
  const group = cls.groups.find((g) => g.id === groupId) ?? null;
  const shown = filterMembers(members, (n) => matchesName(n, query), group);

  if (members.length === 0)
    return (
      <EmptyState
        moment="greeting"
        title={t('teacher.members.emptyTitle')}
        description={t('teacher.members.emptyBody')}
      />
    );
  return (
    <View accessibilityLabel={t('teacher.members.list')} className="gap-2">
      {shown.length === 0 ? <Text tone="muted">{t('teacher.members.noMatch')}</Text> : null}
      {shown.map((m, i) => (
        <MemberRow
          key={m.id}
          member={m}
          index={i}
          groups={cls.groups.filter((g) => g.memberIds.includes(m.id)).map((g) => g.name)}
          onMore={() => setMenuFor(m)}
        />
      ))}
      <MemberActionsSheet
        member={menuFor}
        cls={cls}
        onClose={() => setMenuFor(null)}
        onRemove={setRemoving}
      />
      <ConfirmSheet
        visible={removing !== null}
        danger
        title={removing ? t('teacher.members.removeConfirm', { name: removing.name }) : ''}
        body={t('teacher.members.removeBody')}
        confirmLabel={t('teacher.members.removeSubmit')}
        cancelLabel={t('teacher.members.cancel')}
        onClose={() => setRemoving(null)}
        onConfirm={() => {
          if (removing) remove.mutate({ classId: cls.id, memberId: removing.id });
        }}
      />
    </View>
  );
}
