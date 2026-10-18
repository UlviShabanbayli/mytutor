// Demo data until the parent API exists (architecture V1–V3: /v1/parent/links,
// /v1/parent/children/:id/report?week=, messages). This module plays the server: it keeps the
// state in memory (a reload starts the demo again) and applies the rules the server will apply,
// above all that only the categories a child shares leave it.
import {
  CONSENT_DEFAULT_GRANTS,
  DEMO_CODES,
  DEMO_LAST_ACTIVE,
  DEMO_PREFS,
  DEMO_PROFILE,
  DEMO_SMS_CODE,
  DEMO_TEACHERS,
  demoAssignments,
  demoLinks,
  demoMessages,
  demoNotes,
  demoNotifications,
  demoReports,
  demoSubjects,
} from './demoData';
import type {
  AssignmentList,
  ChatMessage,
  ChildLink,
  ChildOverview,
  ConsentRequest,
  Conversation,
  LinkRequest,
  NotificationKind,
  NotificationPrefs,
  ParentNotification,
  ParentProfile,
  ReportPage,
  ShareCategory,
  SubjectProgress,
  Thread,
} from './types';

/** Why a link code was not accepted; the screen says it in plain words. */
export class LinkCodeError extends Error {
  constructor(
    readonly reason: 'expired' | 'not_found' | 'already_linked',
    readonly childName: string | null = null,
  ) {
    super(reason);
  }
}

export class ConsentCodeError extends Error {
  constructor() {
    super('wrong_code');
  }
}

const REQUEST_HOURS = 24;

function initialState() {
  return {
    links: demoLinks(),
    request: null as LinkRequest | null,
    notes: demoNotes(),
    messages: demoMessages(),
    unread: { lale: 1 } as Record<string, number>,
    notifications: demoNotifications(),
    notificationsRead: false,
    reportsSeen: new Set<string>(),
    prefs: { ...DEMO_PREFS },
  };
}

let state = initialState();

/** Back to the demo as designed (tests). */
export function resetDemo() {
  state = initialState();
}

const copy = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const activeLink = (childId: string) =>
  state.links.find((l) => l.childId === childId && l.status === 'active');

const shares = (link: ChildLink | undefined, category: ShareCategory) =>
  link !== undefined && link.grants.includes(category);

export async function fetchProfile(): Promise<ParentProfile> {
  return { ...DEMO_PROFILE };
}

export async function fetchChildren(): Promise<ChildOverview[]> {
  return state.links.map((link) => {
    const report = link.status === 'active' ? demoReports[link.childId]?.[0] : undefined;
    const week =
      report && shares(link, 'report')
        ? {
            weekStart: report.weekStart,
            minutes: report.minutes,
            activeDays: report.activeDays.filter(Boolean).length,
            newTopics: report.newTopics.length,
            assignments: shares(link, 'assignments') ? report.assignments : null,
            lastActiveAt: DEMO_LAST_ACTIVE[link.childId] ?? null,
            reportIsNew: !state.reportsSeen.has(link.childId),
          }
        : null;
    return { ...copy(link), week };
  });
}

export async function fetchReport(childId: string, week: number): Promise<ReportPage> {
  const link = activeLink(childId);
  const weeks = shares(link, 'report') ? (demoReports[childId] ?? []) : [];
  const found = weeks[week];
  if (!found) return { report: null, hasPrevious: false, hasNext: week > 0 };
  const report = copy(found);
  if (!shares(link, 'assignments')) report.assignments = null;
  if (!shares(link, 'exam')) report.examReadiness = null;
  return { report, hasPrevious: week + 1 < weeks.length, hasNext: week > 0 };
}

export async function markReportSeen(childId: string) {
  state.reportsSeen.add(childId);
}

export async function fetchSubjects(childId: string): Promise<SubjectProgress[]> {
  return shares(activeLink(childId), 'progress') ? copy(demoSubjects[childId] ?? []) : [];
}

export async function fetchAssignments(childId: string): Promise<AssignmentList | null> {
  if (!shares(activeLink(childId), 'assignments')) return null;
  return copy(demoAssignments[childId] ?? null);
}

/** Checks the code a child made; on success the request waits for the child's approval. */
export async function submitLinkCode(code: string): Promise<LinkRequest> {
  const entry = DEMO_CODES[code.toUpperCase()];
  if (entry === undefined) throw new LinkCodeError('not_found');
  if (entry === 'expired') throw new LinkCodeError('expired');
  if (activeLink(entry.childId)) throw new LinkCodeError('already_linked', entry.childName);
  const sentAt = new Date();
  const expiresAt = new Date(sentAt.getTime() + REQUEST_HOURS * 3_600_000);
  state.request = {
    childId: entry.childId,
    childName: entry.childName,
    sentAt: sentAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
  return { ...state.request };
}

export async function fetchLinkRequest(): Promise<LinkRequest | null> {
  return state.request ? { ...state.request } : null;
}

export async function cancelLinkRequest() {
  state.request = null;
}

/** The parent stops watching; the child's learning goes on unchanged. */
export async function stopLink(childId: string) {
  state.links = state.links.filter((l) => l.childId !== childId);
}

export async function fetchConsentRequests(): Promise<ConsentRequest[]> {
  return state.links
    .filter((l) => l.status === 'awaiting_consent')
    .map((l) => ({ childId: l.childId, childName: l.name, phoneMasked: DEMO_PROFILE.phoneMasked }));
}

export async function submitConsent(childId: string, smsCode: string) {
  if (smsCode !== DEMO_SMS_CODE) throw new ConsentCodeError();
  state.links = state.links.map((l) =>
    l.childId === childId ? { ...l, status: 'active', grants: [...CONSENT_DEFAULT_GRANTS] } : l,
  );
}

export async function declineConsent(childId: string) {
  state.links = state.links.filter((l) => l.childId !== childId);
}

/** Teachers of linked children only: a stopped link closes the conversation too. */
const teachers = () => DEMO_TEACHERS.filter((t) => activeLink(t.childId));

export async function fetchConversations(): Promise<Conversation[]> {
  return teachers().map(({ childId: _child, ...contact }) => {
    const messages = state.messages[contact.teacherId] ?? [];
    const last = messages[messages.length - 1];
    const notes = state.notes[contact.teacherId] ?? [];
    return {
      ...contact,
      last: last ? { text: last.text, at: last.at, fromMe: last.from === 'me' } : null,
      latestNote: notes[notes.length - 1] ?? null,
      unread: state.unread[contact.teacherId] ?? 0,
    };
  });
}

export async function fetchThread(teacherId: string): Promise<Thread | null> {
  const teacher = teachers().find((t) => t.teacherId === teacherId);
  if (!teacher) return null;
  const { childId: _child, ...contact } = teacher;
  return {
    ...contact,
    notes: copy(state.notes[teacherId] ?? []),
    messages: copy(state.messages[teacherId] ?? []),
  };
}

export async function markThreadRead(teacherId: string) {
  state.unread[teacherId] = 0;
}

export async function sendMessage(teacherId: string, text: string): Promise<ChatMessage> {
  const message: ChatMessage = {
    id: `m${Date.now()}`,
    from: 'me',
    text,
    at: new Date().toISOString(),
    status: 'sent',
    reported: false,
  };
  state.messages[teacherId] = [...(state.messages[teacherId] ?? []), message];
  return { ...message };
}

/** Sends the message to moderation (architecture P6); messages are never deleted. */
export async function reportMessage(teacherId: string, messageId: string) {
  state.messages[teacherId] = (state.messages[teacherId] ?? []).map((m) =>
    m.id === messageId ? { ...m, reported: true } : m,
  );
}

export async function fetchNotifications(): Promise<{
  items: ParentNotification[];
  unread: number;
}> {
  const items = state.notifications.filter((n) =>
    n.kind === 'weekly_report'
      ? activeLink(n.childId)
      : teachers().some((t) => t.teacherId === n.teacherId),
  );
  return { items: copy(items), unread: state.notificationsRead ? 0 : items.length };
}

export async function markNotificationsRead() {
  state.notificationsRead = true;
}

export async function fetchNotificationPrefs(): Promise<NotificationPrefs> {
  return { ...state.prefs };
}

export async function setNotificationPref(kind: NotificationKind, on: boolean) {
  state.prefs = { ...state.prefs, [kind]: on };
}
