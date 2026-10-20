import { create } from 'zustand';
import { registerDemoReset } from '@/lib/demoEvents';
import { PARENT_CODE_TTL_MS } from './codes';
import type { GrantKey, Grants } from './privacy';

/**
 * What the student changes in the "Mən" area that only this device keeps: the guest preview,
 * a nickname edit, the league choice, sharing switches, reports, reminders and the parent code
 * on screen. Classes, messages and parent links are demo events every role sees.
 */
type MeState = {
  /** No account yet: the tab shows the guest page and account-only screens ask for one. */
  guest: boolean;
  /** A nickname the student typed; null: the one in the demo world. */
  nickname: string | null;
  leagueJoined: boolean;
  grants: Grants;
  /** Ids of messages and materials the student reported (reports never delete anything). */
  reported: string[];
  /** Live lessons the student asked to be reminded of. */
  reminders: string[];
  parentCode: { value: string; expiresAt: number } | null;
  setGuest: (guest: boolean) => void;
  setNickname: (nickname: string) => void;
  setLeagueJoined: (joined: boolean) => void;
  setGrant: (who: keyof Grants, key: GrantKey, on: boolean) => void;
  report: (id: string) => void;
  toggleReminder: (id: string) => void;
  /** Shows a parent code for ten minutes from `now`. */
  showParentCode: (value: string, now?: number) => void;
  clearParentCode: () => void;
};

/** What the demo resets: the nickname edit, the league choice, switches, reports, reminders. */
const ME_DEFAULTS = {
  nickname: null,
  leagueJoined: true,
  grants: {
    teacher: { progress: true, activity: false, examPlan: false },
    parent: { progress: true, activity: true, examPlan: false },
  },
  reported: [],
  reminders: [],
  parentCode: null,
} satisfies Partial<MeState>;

export const useMeStore = create<MeState>((set) => ({
  guest: false,
  ...ME_DEFAULTS,
  setGuest: (guest) => set({ guest }),
  setNickname: (nickname) => set({ nickname: nickname.trim() }),
  setLeagueJoined: (leagueJoined) => set({ leagueJoined }),
  setGrant: (who, key, on) =>
    set((s) => ({ grants: { ...s.grants, [who]: { ...s.grants[who], [key]: on } } })),
  report: (id) => set((s) => (s.reported.includes(id) ? {} : { reported: [...s.reported, id] })),
  toggleReminder: (id) =>
    set((s) => ({
      reminders: s.reminders.includes(id)
        ? s.reminders.filter((r) => r !== id)
        : [...s.reminders, id],
    })),
  showParentCode: (value, now = Date.now()) =>
    set({ parentCode: { value, expiresAt: now + PARENT_CODE_TTL_MS } }),
  clearParentCode: () => set({ parentCode: null }),
}));

// "Demo məlumatını sıfırla": the world's nickname and league again (the guest preview stays).
registerDemoReset(() => useMeStore.setState({ ...ME_DEFAULTS }));
