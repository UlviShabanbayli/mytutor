/*
 * Demo data until the teacher API exists (architecture M1–M8). These functions are the seam:
 * each one becomes a call to /v1/teacher/*, /v1/classes/* or /v1/assignments/* and the hooks
 * in queries.ts stay as they are. The state lives in memory and resets on reload.
 */
import { classShortName, makeInviteCode } from './classroom';
import { BOOK, createDemoDb, TOPICS, UNIT_TOPICS, type TeacherDemoDb } from './demo';
import type {
  Audience,
  AssignmentKind,
  ClassMember,
  Material,
  SolutionStep,
  TeacherClass,
} from './types';

let db: TeacherDemoDb = createDemoDb(new Date());
let nextId = 1;
const newId = (prefix: string) => `${prefix}-${nextId++}`;

/** Fresh demo state (tests). */
export function resetTeacherDemo(now = new Date()) {
  db = createDemoDb(now);
}

function notFound(what: string): never {
  throw new Error(`${what} not found`);
}

export const fetchProfile = async () => db.profile;
export const fetchTopics = async () => TOPICS;
/** The unit the demo class works on: Çərçivə 4 "Müxtəsər vurma düsturları". */
export const fetchUnit = async () => ({ number: 4, book: BOOK, topicIds: UNIT_TOPICS });
export const fetchClasses = async () => db.classes;
export const fetchNotices = async () => db.notices;
export const fetchConversations = async () => db.conversations;
export const fetchMaterials = async () => db.materials;
export const fetchInbox = async () => db.inbox;

export async function fetchClass(id: string) {
  return db.classes.find((c) => c.id === id) ?? notFound(`class ${id}`);
}

export async function fetchMembers(classId: string): Promise<ClassMember[]> {
  return db.members[classId] ?? [];
}

export async function fetchAssignments(classId: string) {
  return db.assignments.filter((a) => a.classId === classId);
}

export async function fetchAnnouncements(classId: string) {
  return db.announcements.filter((a) => a.classId === classId);
}

export async function fetchAssignment(id: string) {
  return db.assignments.find((a) => a.id === id) ?? notFound(`assignment ${id}`);
}

export async function fetchSubmissions(assignmentId: string) {
  return db.submissions.filter((s) => s.assignmentId === assignmentId);
}

export async function fetchQuestion(id: string) {
  return db.inbox.find((q) => q.id === id) ?? notFound(`question ${id}`);
}

export async function fetchBank(topicId: string) {
  return db.bank.filter((q) => q.topicId === topicId);
}

/** The bank questions a test starts with: a draft's own, or the ones Vızı picks for 4.1–4.2. */
export async function fetchTestDraft(draftId: string | undefined) {
  const draft = db.materials.find((m) => m.id === draftId && m.kind === 'test');
  if (draft) return { title: draft.title, topicId: '4.2', questionIds: ['b421', 'b422', 'b423'] };
  return { title: null, topicId: '4.1', questionIds: ['b411', 'b412', 'b421', 'b422'] };
}

/** Every bank question, for counting a selection across topics. */
export const fetchWholeBank = async () => db.bank;

/** null = no report yet (a new class, or nobody shared progress). */
export async function fetchInsights(classId: string) {
  return db.insights.find((i) => i.classId === classId) ?? null;
}

/** "Bu gün" on the classes tab: homework waiting for the teacher and today's live lessons. */
export async function fetchToday() {
  return { homework: db.assignments.filter((a) => a.toGrade > 0), live: db.live };
}

export async function fetchLiveRooms() {
  return db.live;
}

export async function fetchLiveRoom(id: string) {
  return db.live.find((r) => r.id === id) ?? notFound(`live room ${id}`);
}

export type NewClassInput = { subject: string; grade: number; name: string };

export async function createClass(input: NewClassInput): Promise<TeacherClass> {
  const shortName = classShortName(input.name);
  const created: TeacherClass = {
    id: newId('class'),
    shortName,
    name: input.name.trim(),
    subject: input.subject,
    book: `${input.subject} ${input.grade}`,
    grade: input.grade,
    paid: false,
    inviteCode: makeInviteCode(shortName, 'MATH'),
    groups: [],
    studentCount: 0,
    activeThisWeek: 0,
    activeAssignments: 0,
    completion: 0,
    chatOpen: true,
    chatUnread: 0,
  };
  db = { ...db, classes: [...db.classes, created], members: { ...db.members, [created.id]: [] } };
  return created;
}

function updateClass(id: string, patch: (c: TeacherClass) => TeacherClass) {
  db = { ...db, classes: db.classes.map((c) => (c.id === id ? patch(c) : c)) };
}

export async function setClassChat(classId: string, open: boolean) {
  updateClass(classId, (c) => ({ ...c, chatOpen: open }));
}

export async function postAnnouncement(classId: string, text: string) {
  const item = { id: newId('ann'), classId, text: text.trim(), at: new Date().toISOString() };
  db = { ...db, announcements: [item, ...db.announcements] };
  return item;
}

/** The SMS invite is sent by the API (Twilio Verify stays server-side); the demo only accepts. */
export async function inviteByPhone(_classId: string, _phone: string) {
  return { sent: true };
}

export async function addGroup(classId: string, name: string) {
  updateClass(classId, (c) => ({
    ...c,
    groups: [...c.groups, { id: newId('group'), name: name.trim(), memberIds: [] }],
  }));
}

export async function toggleGroupMember(classId: string, groupId: string, memberId: string) {
  updateClass(classId, (c) => ({
    ...c,
    groups: c.groups.map((g) =>
      g.id !== groupId
        ? g
        : {
            ...g,
            memberIds: g.memberIds.includes(memberId)
              ? g.memberIds.filter((m) => m !== memberId)
              : [...g.memberIds, memberId],
          },
    ),
  }));
}

export async function setMemberMuted(classId: string, memberId: string, muted: boolean) {
  const list = db.members[classId] ?? [];
  const members = list.map((m) => (m.id === memberId ? { ...m, mutedInChat: muted } : m));
  db = { ...db, members: { ...db.members, [classId]: members } };
}

export async function removeMember(classId: string, memberId: string) {
  const members = (db.members[classId] ?? []).filter((m) => m.id !== memberId);
  db = { ...db, members: { ...db.members, [classId]: members } };
  updateClass(classId, (c) => ({
    ...c,
    studentCount: Math.max(0, c.studentCount - 1),
    groups: c.groups.map((g) => ({ ...g, memberIds: g.memberIds.filter((m) => m !== memberId) })),
  }));
}

export type NewAssignmentInput = {
  classId: string;
  kind: AssignmentKind;
  topicId: string;
  audience: Audience;
  dueAt: string;
  total: number;
  unit?: number;
};

export async function createAssignment(input: NewAssignmentInput) {
  const item = { ...input, id: newId('asg'), done: 0, toGrade: 0 };
  db = { ...db, assignments: [item, ...db.assignments] };
  updateClass(input.classId, (c) => ({ ...c, activeAssignments: c.activeAssignments + 1 }));
  return item;
}

export async function saveGrade(submissionId: string, grade: number, comment: string) {
  const sub = db.submissions.find((s) => s.id === submissionId);
  const wasGraded = sub?.grade !== null;
  db = {
    ...db,
    submissions: db.submissions.map((s) => (s.id === submissionId ? { ...s, grade, comment } : s)),
    assignments: db.assignments.map((a) =>
      sub && a.id === sub.assignmentId && !wasGraded
        ? { ...a, toGrade: Math.max(0, a.toGrade - 1) }
        : a,
    ),
  };
}

/** The teacher's answer replaces the AI draft; the student sees "Müəllim təsdiqlədi". */
export async function approveAnswer(id: string, steps: SolutionStep[], topicId: string) {
  db = {
    ...db,
    inbox: db.inbox.map((q) =>
      q.id === id ? { ...q, approved: true, topicId, ai: { ...q.ai, steps } } : q,
    ),
  };
}

export type NewTestInput = { title: string; questionIds: string[]; audience: 'class' | 'catalog' };

export async function saveTest(input: NewTestInput): Promise<Material> {
  const item: Material = {
    id: newId('mat'),
    kind: 'test',
    title: input.title,
    size: input.questionIds.length,
    state: input.audience === 'catalog' ? 'in_review' : 'class',
    updatedAt: new Date().toISOString(),
  };
  db = { ...db, materials: [item, ...db.materials] };
  return item;
}
