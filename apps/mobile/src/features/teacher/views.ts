import type {
  AppNotification,
  AskQuestionView,
  BankQuestion,
  ChatThreadView,
  ClassInsights,
  CourseTopic,
  CurriculumResponse,
  LiveLesson,
  Material,
  RosterEntry,
  TeacherAssignment,
  TeacherClassDetail,
  TeacherClassView,
  TeacherHome,
} from '@mytutor/types';
import type {
  ClassAssignment,
  Conversation,
  InboxQuestion,
  InsightsView,
  LiveRoom,
  TeacherClass,
  TeacherNotice,
  TeacherProfileView,
  TopicView,
  UnitView,
} from './types';

/** Pure maps from the demo world's answers to what the teacher screens show. */

/** The ready textbook volumes (TRİMS 7, part 1): their units and topics in book order. */
export type Contents = { units: UnitView[]; topics: TopicView[] };

const topicView = (t: CourseTopic): TopicView => ({
  id: t.id,
  number: t.number,
  title: t.shortTitle,
  page: t.pages.start,
});

export function contentsOf(curriculum: CurriculumResponse): Contents {
  const units = curriculum.textbooks.flatMap((book) =>
    book.volumes
      .filter((v) => v.ready)
      .flatMap((v) =>
        v.units.map((u): UnitView => ({
          id: u.id,
          number: u.number,
          bookTitle: book.title,
          part: v.part,
          topics: u.topics.map(topicView),
        })),
      ),
  );
  return { units, topics: units.flatMap((u) => u.topics) };
}

export const topicOf = (contents: Contents, id: string): TopicView | null =>
  contents.topics.find((t) => t.id === id) ?? null;

export const unitOfTopic = (contents: Contents, topicId: string): UnitView | null =>
  contents.units.find((u) => u.topics.some((t) => t.id === topicId)) ?? null;

/** The unit the teacher works on: the one of her newest assignment (the first unit if none). */
export function currentUnit(contents: Contents, list: TeacherAssignment[]): UnitView | null {
  const newest = [...list].sort((a, b) => b.assignedAt.localeCompare(a.assignedAt))[0];
  return (newest && unitOfTopic(contents, newest.topicId)) ?? contents.units[0] ?? null;
}

export const profileOf = (home: TeacherHome): TeacherProfileView => ({
  ...home.profile,
  name: home.person.fullName,
});

export const classOf = (c: TeacherClassView): TeacherClass => ({
  ...c,
  book: `${c.subject} ${c.grade}`,
});

export const assignmentOf = (contents: Contents, a: TeacherAssignment): ClassAssignment => ({
  ...a,
  topic: topicOf(contents, a.topicId),
  unitNumber: a.unitId ? (contents.units.find((u) => u.id === a.unitId)?.number ?? null) : null,
});

/** A question as the inbox shows it; once answered, the teacher's steps replace the AI's. */
export const inboxQuestionOf = (q: AskQuestionView): InboxQuestion => ({
  ...q,
  askedAt: q.timeline[0]?.at ?? '',
  approved: q.status === 'answered',
  aiStatus: q.aiDraft?.status ?? (q.answer ? 'ready' : 'solving'),
  steps: q.answer?.steps ?? q.aiDraft?.steps ?? [],
});

export const insightsOf = (contents: Contents, i: ClassInsights): InsightsView => ({
  ...i,
  unitNumber: contents.units.find((u) => u.id === i.unitId)?.number ?? '',
});

/**
 * The live room with names from the class roster; the teacher's own tile is `me`. Students who
 * are no longer in the class (removed) are not in the room.
 */
export function liveRoomOf(
  contents: Contents,
  lesson: LiveLesson,
  roster: RosterEntry[],
  teacher: { id: string; name: string },
): LiveRoom {
  const names = new Map(roster.map((m) => [m.personId, m.name]));
  names.set(teacher.id, teacher.name);
  const inRoom = (id: string) => names.has(id);
  const name = (id: string) => names.get(id) ?? id;
  return {
    id: lesson.id,
    classId: lesson.classId,
    title: lesson.title,
    topic: topicOf(contents, lesson.topicId),
    startsAt: lesson.startsAt,
    minutes: lesson.minutes,
    present: lesson.room.present,
    total: roster.length,
    participants: lesson.room.participants
      .filter((p) => inRoom(p.personId))
      .map((p) => ({
        id: p.personId,
        name: name(p.personId),
        state: p.personId === teacher.id ? 'me' : p.state === 'speaking' ? 'muted' : p.state,
      })),
    hands: lesson.room.hands
      .filter((h) => inRoom(h.personId))
      .map((h) => ({
        studentId: h.personId,
        name: name(h.personId),
        at: h.at,
      })),
    board: lesson.board.map((line) => line.text),
    chatUnread: lesson.room.chatUnread,
  };
}

/** A class's roster, groups (the world drops removed students), assignments, announcements. */
export function classDetailOf(contents: Contents, detail: TeacherClassDetail) {
  return {
    class: classOf(detail.class),
    members: detail.members,
    assignments: detail.assignments.map((a) => assignmentOf(contents, a)),
    announcements: detail.announcements,
  };
}

/** A conversation in the teacher's list; the world names the child a parent writes about. */
export const conversationOf = (t: ChatThreadView): Conversation => ({ ...t });

/** The teacher's notifications for the bell, with names and topic numbers filled in. */
export function noticesOf(
  list: AppNotification[],
  inbox: AskQuestionView[],
  assignments: ClassAssignment[],
): TeacherNotice[] {
  return list.flatMap((n): TeacherNotice[] => {
    const base = { id: n.id, read: n.read, at: n.at };
    switch (n.kind) {
      case 'question':
        return [
          {
            ...base,
            kind: 'question',
            name: inbox.find((q) => q.id === n.questionId)?.studentName ?? n.studentId,
          },
        ];
      case 'homework':
        return [
          {
            ...base,
            kind: 'homework',
            count: n.count,
            topic: assignments.find((a) => a.id === n.assignmentId)?.topic?.number ?? '',
          },
        ];
      case 'verification':
        return [{ ...base, kind: 'verification' }];
      default:
        return [];
    }
  });
}

/** A material's size in the unit its row shows: minutes of a video, KB of a file, a count. */
export const materialSize = (m: Material): number =>
  m.kind === 'video' ? Math.max(1, Math.round(m.size / 60)) : m.size;

export type TestStart = { title: string | null; topicId: string; questionIds: string[] };

/**
 * Where the test builder starts: a draft's topic with its first questions, or a new test with
 * the two questions Vızı picks from each of the unit's first two topics.
 */
export function testStartOf(
  draftId: string | undefined,
  materials: Material[],
  bank: BankQuestion[],
  unit: UnitView | null,
): TestStart {
  const ofTopic = (topicId: string, count: number) =>
    bank
      .filter((q) => q.topicId === topicId)
      .slice(0, count)
      .map((q) => q.id);
  const draft = materials.find((m) => m.id === draftId && m.kind === 'test');
  if (draft?.topicId)
    return {
      title: draft.title,
      topicId: draft.topicId,
      questionIds: ofTopic(draft.topicId, draft.size),
    };
  const first = (unit?.topics ?? []).slice(0, 2).map((t) => t.id);
  return {
    title: null,
    topicId: first[0] ?? '',
    questionIds: first.flatMap((id) => ofTopic(id, 2)),
  };
}
