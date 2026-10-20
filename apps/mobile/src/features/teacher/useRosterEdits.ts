import type { ClassGroup, RosterEntry } from '@mytutor/types';
import { useMuteMember, useSaveGroup } from './mutations';
import { toggleId } from './testBuilder';

/**
 * Groups and chat mutes the teacher changes on the members screen, written as the demo events
 * `group.saved` and `member.muted`: the world answers with them, on every screen and role.
 */
export function useRosterEdits(classId: string, groups: ClassGroup[], members: RosterEntry[]) {
  const saveGroup = useSaveGroup();
  const mute = useMuteMember();
  const save = (group: ClassGroup) => saveGroup.mutate({ classId, group });

  return {
    groups,
    members,
    addGroup: (name: string) => {
      const ids = new Set(groups.map((g) => g.id));
      let n = groups.length + 1;
      while (ids.has(`group-${n}`)) n += 1;
      save({ id: `group-${n}`, name: name.trim(), memberIds: [] });
    },
    toggleGroupMember: (groupId: string, personId: string) => {
      const group = groups.find((g) => g.id === groupId);
      if (group) save({ ...group, memberIds: toggleId(group.memberIds, personId) });
    },
    setMuted: (personId: string, value: boolean) =>
      mute.mutate({ classId, studentId: personId, muted: value }),
  };
}

export type RosterEdits = ReturnType<typeof useRosterEdits>;
