import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/lib/api';
import * as api from './api';
import {
  assignmentsQuery,
  classQuery,
  contentsQuery,
  homeQuery,
  teacherKey,
  useTeacherScope,
} from './teacherQuery';
import {
  classOf,
  conversationOf,
  currentUnit,
  inboxQuestionOf,
  insightsOf,
  liveRoomOf,
  noticesOf,
  profileOf,
  testStartOf,
  unitOfTopic,
} from './views';

/** The teacher area's reads of the demo world. Writes are in mutations.ts. */

const notFound = (what: string) => new ApiError(404, `${what} not found`);

/** The unit a topic is in (the first ready unit for none), for picking a topic near it. */
export function useTopicUnit(topicId: string | null) {
  const { persona } = useTeacherScope();
  return useQuery({
    ...contentsQuery(persona),
    select: (c) => (topicId ? unitOfTopic(c, topicId) : null) ?? c.units[0] ?? null,
  });
}

/** The unit the teacher's classes work on (that of her newest assignment). */
export function useUnit() {
  const { persona, client } = useTeacherScope();
  return useQuery({
    queryKey: teacherKey(persona, 'unit'),
    queryFn: async () => {
      const [contents, list] = await Promise.all([
        client.ensureQueryData(contentsQuery(persona)),
        api.getAssignments(persona),
      ]);
      const unit = currentUnit(contents, list);
      if (!unit) throw notFound('unit');
      return unit;
    },
  });
}

export function useTeacherProfile() {
  const { persona } = useTeacherScope();
  return useQuery({ ...homeQuery(persona), select: profileOf });
}

export function useTeacherClasses() {
  const { persona } = useTeacherScope();
  return useQuery({ ...homeQuery(persona), select: (h) => h.classes.map(classOf) });
}

export function useTeacherAssignments() {
  const { persona, client } = useTeacherScope();
  return useQuery(assignmentsQuery(persona, client));
}

export function useAssignment(id: string) {
  const { persona, client } = useTeacherScope();
  return useQuery({
    ...assignmentsQuery(persona, client),
    select: (list) => list.find((a) => a.id === id) ?? null,
  });
}

/** "Bu gün": homework waiting for the teacher and the coming live lessons. */
export function useTeacherToday() {
  const { persona, client } = useTeacherScope();
  return useQuery({
    queryKey: teacherKey(persona, 'today'),
    queryFn: async () => {
      const [list, live] = await Promise.all([
        client.fetchQuery(assignmentsQuery(persona, client)),
        api.getLive(persona),
      ]);
      const now = Date.now();
      return {
        homework: list.filter((a) => a.kind === 'homework' && a.toGrade > 0),
        live: live.filter((l) => Date.parse(l.startsAt) + l.minutes * 60_000 > now),
      };
    },
  });
}

export function useTeacherClass(id: string) {
  const { persona, client } = useTeacherScope();
  return useQuery({ ...classQuery(persona, client, id), select: (d) => d.class });
}

export function useClassMembers(id: string) {
  const { persona, client } = useTeacherScope();
  return useQuery({ ...classQuery(persona, client, id), select: (d) => d.members });
}

export function useClassAssignments(id: string) {
  const { persona, client } = useTeacherScope();
  return useQuery({ ...classQuery(persona, client, id), select: (d) => d.assignments });
}

export function useAnnouncements(classId: string) {
  const { persona } = useTeacherScope();
  return useQuery({
    queryKey: teacherKey(persona, 'classes', classId, 'announcements'),
    queryFn: () => api.getAnnouncements(persona, classId),
  });
}

/** Handed-in work of an assignment, waiting ones first. */
export function useSubmissions(assignmentId: string) {
  const { persona } = useTeacherScope();
  return useQuery({
    queryKey: teacherKey(persona, 'assignments', assignmentId, 'submissions'),
    queryFn: async () =>
      (await api.getSubmissions(persona, assignmentId)).filter((s) => s.submittedAt !== null),
  });
}

export function useTeacherInbox() {
  const { persona } = useTeacherScope();
  return useQuery({
    queryKey: teacherKey(persona, 'inbox'),
    queryFn: async () => (await api.getInbox(persona)).map(inboxQuestionOf),
  });
}

export function useInboxQuestion(id: string) {
  const { persona } = useTeacherScope();
  return useQuery({
    queryKey: teacherKey(persona, 'inbox', id),
    queryFn: async () => inboxQuestionOf(await api.getQuestion(persona, id)),
  });
}

export function useMaterials() {
  const { persona } = useTeacherScope();
  return useQuery({
    queryKey: teacherKey(persona, 'materials'),
    queryFn: () => api.getMaterials(persona),
  });
}

/** Every bank question, for counting a selection across topics. */
export function useWholeBank() {
  const { persona } = useTeacherScope();
  return useQuery({ queryKey: teacherKey(persona, 'bank'), queryFn: () => api.getBank(persona) });
}

export function useBank(topicId: string) {
  const { persona } = useTeacherScope();
  return useQuery({
    queryKey: teacherKey(persona, 'bank'),
    queryFn: () => api.getBank(persona),
    select: (bank) => bank.filter((q) => q.topicId === topicId),
  });
}

/** Where the test builder starts: a saved draft, or Vızı's picks for a new test. */
export function useTestDraft(draftId: string | undefined) {
  const { persona, client } = useTeacherScope();
  return useQuery({
    queryKey: teacherKey(persona, 'testStart', draftId ?? 'new'),
    queryFn: async () => {
      const [materials, bank, contents, list] = await Promise.all([
        api.getMaterials(persona),
        api.getBank(persona),
        client.ensureQueryData(contentsQuery(persona)),
        api.getAssignments(persona),
      ]);
      return testStartOf(draftId, materials, bank, currentUnit(contents, list));
    },
  });
}

/** null: no report for this class (none of the teacher's, or nothing to show yet). */
export function useClassInsights(classId: string) {
  const { persona, client } = useTeacherScope();
  return useQuery({
    queryKey: teacherKey(persona, 'insights', classId),
    queryFn: async () => {
      const contents = await client.ensureQueryData(contentsQuery(persona));
      try {
        return insightsOf(contents, await api.getInsights(persona, classId));
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    },
  });
}

export function useLiveRooms() {
  const { persona } = useTeacherScope();
  return useQuery({ queryKey: teacherKey(persona, 'live'), queryFn: () => api.getLive(persona) });
}

/** The live room with the class roster's names on its tiles. */
export function useLiveRoom(id: string) {
  const { persona, client } = useTeacherScope();
  return useQuery({
    queryKey: teacherKey(persona, 'live', id),
    queryFn: async () => {
      const [live, home, contents] = await Promise.all([
        api.getLive(persona),
        client.ensureQueryData(homeQuery(persona)),
        client.ensureQueryData(contentsQuery(persona)),
      ]);
      const lesson = live.find((l) => l.id === id);
      if (!lesson) throw notFound(`live lesson ${id}`);
      const detail = await api.getClass(persona, lesson.classId);
      return liveRoomOf(contents, lesson, detail.members, {
        id: home.profile.personId,
        name: home.person.fullName,
      });
    },
  });
}

/** The teacher's conversations, newest first, with the child a parent writes about. */
export function useConversations() {
  const { persona, client } = useTeacherScope();
  return useQuery({
    queryKey: teacherKey(persona, 'messages'),
    queryFn: async () => {
      const [threads, home] = await Promise.all([
        api.getThreads(persona),
        client.ensureQueryData(homeQuery(persona)),
      ]);
      const rosters = await Promise.all(
        home.classes.map((c) => client.ensureQueryData(classQuery(persona, client, c.id))),
      );
      const names = new Map(rosters.flatMap((r) => r.members.map((m) => [m.personId, m.name])));
      return threads.map((t) => conversationOf(t, names));
    },
  });
}

/** One conversation with its messages; `null` waits. */
export function useThread(id: string | null) {
  const { persona } = useTeacherScope();
  return useQuery({
    queryKey: teacherKey(persona, 'messages', id ?? ''),
    queryFn: () => api.getThread(persona, id ?? ''),
    enabled: id !== null,
  });
}

/** The bell's list: the teacher's notifications with names and topic numbers. */
export function useNotices() {
  const { persona, client } = useTeacherScope();
  return useQuery({
    queryKey: teacherKey(persona, 'notices'),
    queryFn: async () => {
      const [list, inbox, assignments] = await Promise.all([
        api.getNotifications(persona),
        api.getInbox(persona),
        client.fetchQuery(assignmentsQuery(persona, client)),
      ]);
      return noticesOf(list, inbox, assignments);
    },
  });
}

/** Counts on the teacher menu: questions waiting for an answer, conversations with news. */
export function useTeacherBadges() {
  const inbox = useTeacherInbox();
  const conversations = useConversations();
  return {
    inbox: inbox.data?.filter((q) => !q.approved).length ?? 0,
    messages: conversations.data?.filter((c) => c.unread > 0).length ?? 0,
  };
}
