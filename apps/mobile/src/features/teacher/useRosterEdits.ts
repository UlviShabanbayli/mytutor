import { useState } from 'react';
import type { ClassGroup, RosterEntry } from '@mytutor/types';
import { toggleId } from './testBuilder';

/**
 * Groups and chat mutes the teacher changes on the members screen. The shared demo events have
 * no type for them yet (proposals: `group.saved`, `member.muted`), so they live on this screen
 * only and are not kept.
 */
export function useRosterEdits(groups: ClassGroup[], members: RosterEntry[]) {
  const [edited, setEdited] = useState<ClassGroup[] | null>(null);
  const [muted, setMuted] = useState<Record<string, boolean>>({});
  const current = edited ?? groups;

  return {
    groups: current,
    members: members.map((m) => ({ ...m, mutedInChat: muted[m.personId] ?? m.mutedInChat })),
    addGroup: (name: string) =>
      setEdited([
        ...current,
        { id: `group-${current.length + 1}`, name: name.trim(), memberIds: [] },
      ]),
    toggleGroupMember: (groupId: string, personId: string) =>
      setEdited(
        current.map((g) =>
          g.id === groupId ? { ...g, memberIds: toggleId(g.memberIds, personId) } : g,
        ),
      ),
    setMuted: (personId: string, value: boolean) => setMuted((m) => ({ ...m, [personId]: value })),
  };
}

export type RosterEdits = ReturnType<typeof useRosterEdits>;
