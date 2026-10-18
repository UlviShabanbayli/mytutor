import { create } from 'zustand';
import { DEMO_NICKNAME, PARENT_CODE_TTL_MS, demoParentLinks, makeParentCode } from './demo';
import type { GrantKey, Grants } from './privacy';
import type { ChatMessage, ParentLinkView, ParentRequest } from './types';

/**
 * What the student changes in the "Mən" area, kept in memory for the demo. Each action is one
 * API call later (architecture Ş10, Ş11, V1, P2); the screens already read it through hooks.
 */
type MeState = {
  /** No account yet: the tab shows the guest page and account-only screens ask for one. */
  guest: boolean;
  nickname: string;
  leagueJoined: boolean;
  grants: Grants;
  classIds: string[];
  /** Messages the student sent, by class; the demo history comes from the messages query. */
  sent: Record<string, ChatMessage[]>;
  /** Ids of messages and materials the student reported (reports never delete anything). */
  reported: string[];
  /** Live lessons the student asked to be reminded of. */
  reminders: string[];
  parentCode: { value: string; expiresAt: number } | null;
  parentLinks: ParentLinkView[];
  /** Requests the student turned down or approved, so they do not show again. */
  handledRequests: string[];
  setGuest: (guest: boolean) => void;
  setNickname: (nickname: string) => void;
  setLeagueJoined: (joined: boolean) => void;
  setGrant: (who: keyof Grants, key: GrantKey, on: boolean) => void;
  joinClass: (id: string) => void;
  leaveClass: (id: string) => void;
  send: (classId: string, message: ChatMessage) => void;
  report: (id: string) => void;
  toggleReminder: (id: string) => void;
  newParentCode: (now?: number) => void;
  approveParent: (request: ParentRequest, now?: Date) => void;
  rejectParent: (requestId: string) => void;
  stopParentLink: (id: string) => void;
};

const toIsoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const useMeStore = create<MeState>((set) => ({
  guest: false,
  nickname: DEMO_NICKNAME,
  leagueJoined: true,
  grants: {
    teacher: { progress: true, activity: false, examPlan: false },
    parent: { progress: true, activity: true, examPlan: false },
  },
  classIds: ['7b'],
  sent: {},
  reported: [],
  reminders: [],
  parentCode: null,
  parentLinks: demoParentLinks,
  handledRequests: [],
  setGuest: (guest) => set({ guest }),
  setNickname: (nickname) => set({ nickname: nickname.trim() }),
  setLeagueJoined: (leagueJoined) => set({ leagueJoined }),
  setGrant: (who, key, on) =>
    set((s) => ({ grants: { ...s.grants, [who]: { ...s.grants[who], [key]: on } } })),
  joinClass: (id) => set((s) => (s.classIds.includes(id) ? {} : { classIds: [...s.classIds, id] })),
  leaveClass: (id) => set((s) => ({ classIds: s.classIds.filter((c) => c !== id) })),
  send: (classId, message) =>
    set((s) => ({ sent: { ...s.sent, [classId]: [...(s.sent[classId] ?? []), message] } })),
  report: (id) => set((s) => (s.reported.includes(id) ? {} : { reported: [...s.reported, id] })),
  toggleReminder: (id) =>
    set((s) => ({
      reminders: s.reminders.includes(id)
        ? s.reminders.filter((r) => r !== id)
        : [...s.reminders, id],
    })),
  newParentCode: (now = Date.now()) =>
    set({ parentCode: { value: makeParentCode(), expiresAt: now + PARENT_CODE_TTL_MS } }),
  approveParent: (request, now = new Date()) =>
    set((s) => ({
      parentCode: null,
      handledRequests: [...s.handledRequests, request.id],
      parentLinks: [
        ...s.parentLinks,
        { id: request.id, name: request.name, relation: request.relation, since: toIsoDay(now) },
      ],
    })),
  rejectParent: (requestId) =>
    set((s) => ({ parentCode: null, handledRequests: [...s.handledRequests, requestId] })),
  stopParentLink: (id) => set((s) => ({ parentLinks: s.parentLinks.filter((p) => p.id !== id) })),
}));
