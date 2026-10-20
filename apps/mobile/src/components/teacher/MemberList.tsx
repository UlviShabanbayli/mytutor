import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { RosterEntry } from '@mytutor/types';
import { EmptyState, Text } from '@/components/ui';
import { filterMembers } from '@/features/teacher/classroom';
import { useRemoveMember } from '@/features/teacher/mutations';
import { matchesName } from '@/features/teacher/people';
import type { TeacherClass } from '@/features/teacher/types';
import type { RosterEdits } from '@/features/teacher/useRosterEdits';
import { ConfirmSheet } from './ConfirmSheet';
import { MemberActionsSheet } from './MemberActionsSheet';
import { MemberRow } from './MemberRow';

type MemberListProps = {
  cls: TeacherClass;
  members: RosterEntry[];
  query: string;
  groupId: string | null;
  edits: Pick<RosterEdits, 'toggleGroupMember' | 'setMuted'>;
};

/** The class's students for a search and group filter, with each student's menu. */
export function MemberList({ cls, members, query, groupId, edits }: MemberListProps) {
  const { t } = useTranslation();
  const remove = useRemoveMember();
  const [menuFor, setMenuFor] = useState<RosterEntry | null>(null);
  const [removing, setRemoving] = useState<RosterEntry | null>(null);
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
          key={m.personId}
          member={m}
          index={i}
          groups={cls.groups.filter((g) => g.memberIds.includes(m.personId)).map((g) => g.name)}
          onMore={() => setMenuFor(m)}
        />
      ))}
      <MemberActionsSheet
        member={menuFor}
        cls={cls}
        onClose={() => setMenuFor(null)}
        onToggleGroup={edits.toggleGroupMember}
        onMute={edits.setMuted}
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
          if (removing) remove.mutate({ classId: cls.id, studentId: removing.personId });
        }}
      />
    </View>
  );
}
