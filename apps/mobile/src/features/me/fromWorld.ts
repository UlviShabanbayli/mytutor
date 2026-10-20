import type {
  BadgeId,
  ChatThreadDetail,
  ClassFeed as WorldFeed,
  ClassPreview,
  ClassSummary as WorldSummary,
  LiveLesson,
  MeResponse,
  RankId,
  StudentAssignment,
  TextbookProgress as WorldTextbook,
} from '@mytutor/types';
import type {
  AssignmentDetail,
  AssignmentStatus,
  BadgeView,
  ChatMessage,
  ClassAssignment,
  ClassFeed,
  ClassSummary,
  LiveSession,
  MeOverview,
  ParentLinkView,
  ParentRequest,
  TextbookProgress,
} from './types';
import { clockOf, dayOf, whenOf } from './when';

/** The demo world's "Mən" data as the screens show it; moments become Baku days and times. */

const BADGE_LOOK: Record<BadgeId, Omit<BadgeView, 'id'>> = {
  firstHoney: { icon: 'drop', fill: 'honey', ink: 'on-honey' },
  week: { icon: 'wing', fill: 'sealed', ink: 'on-sealed' },
  precise: { icon: 'target', fill: 'ok-bg', ink: 'ok' },
  mock: { icon: 'star', fill: 'info-bg', ink: 'info' },
  sealMaster: { icon: 'trophy', fill: 'spot', ink: 'honey' },
};

export const badgeView = (id: BadgeId): BadgeView => ({ id, ...BADGE_LOOK[id] });

export function toOverview(me: MeResponse): MeOverview {
  const { profile } = me;
  return {
    personId: me.person.id,
    name: profile.name ?? me.person.fullName,
    grade: profile.grade,
    nickname: profile.nickname,
    shields: profile.shields,
    points: profile.points.total,
    weekPoints: profile.points.week,
    streak: profile.streak,
    honeyCells: me.honeyCells,
    rank: profile.rank,
    nextRank: me.nextRank,
    badges: me.badges.filter((b) => b.earnedAt !== null).map((b) => badgeView(b.id)),
    badgesTotal: me.badges.length,
    unreadInClasses: me.unreadInClasses,
    classCount: profile.classIds.length,
    league: profile.league,
    plan: profile.plan,
  };
}

/**
 * The "new rank" moment the demo shows: the student's next rank at its points, with the first
 * badge not earned yet.
 */
export function toReward(me: MeResponse): {
  rank: RankId;
  points: number;
  shields: number;
  badge: BadgeId;
} {
  const badge = me.badges.find((b) => b.earnedAt === null) ?? me.badges[me.badges.length - 1];
  return {
    rank: me.nextRank?.id ?? me.profile.rank,
    points: me.nextRank?.minPoints ?? me.profile.points.total,
    shields: me.profile.shields,
    badge: badge?.id ?? 'firstHoney',
  };
}

export const toTextbook = (b: WorldTextbook): TextbookProgress => ({
  id: b.subjectId,
  title: b.title,
  status: b.status,
  topics: b.topics,
  units: b.units,
  levels: {
    not_started: b.levels.not_started ?? 0,
    lesson_completed: b.levels.lesson_completed ?? 0,
    mastered: b.levels.mastered ?? 0,
    reinforced: b.levels.reinforced ?? 0,
    needs_practice: b.levels.needs_practice ?? 0,
  },
});

export function toClassSummary(c: WorldSummary, now: Date): ClassSummary {
  return {
    id: c.id,
    short: c.shortName,
    name: c.name,
    teacherId: c.teacher.id,
    teacher: c.teacher.name,
    teacherInitials: c.teacher.initials,
    students: c.students,
    unread: c.unread,
    newMessages: c.newMessages,
    newAnnouncements: c.newAnnouncements,
    nextAssignment: c.nextAssignment
      ? {
          id: c.nextAssignment.id,
          title: c.nextAssignment.title,
          due: whenOf(c.nextAssignment.dueAt, now),
        }
      : null,
    nextLive: c.nextLive ? whenOf(c.nextLive.startsAt, now) : null,
    jar: c.jar,
  };
}

/** Where the student is with an assignment, as the class feed words it. */
function statusOf(a: StudentAssignment): AssignmentStatus {
  const state = a.submission?.state;
  if (state === 'checked') return 'checked';
  if (state === 'submitted') return 'submitted';
  return 'not_started';
}

export function toClassAssignment(a: StudentAssignment, now: Date): ClassAssignment {
  const grade = a.submission?.grade;
  return {
    id: a.id,
    kind: a.kind,
    topic: a.topic.number,
    topicId: a.topic.id,
    title: a.title,
    ...(a.itemCount !== undefined ? { questions: a.itemCount } : {}),
    due: whenOf(a.dueAt, now),
    status: statusOf(a),
    ...(grade ? { grade: { score: grade.score, max: grade.max } } : {}),
    ...(a.testId ? { testId: a.testId } : {}),
  };
}

export function toClassFeed(feed: WorldFeed, now: Date): ClassFeed {
  const announcement = feed.announcements[0];
  return {
    announcement: announcement
      ? { id: announcement.id, text: announcement.text, time: whenOf(announcement.at, now) }
      : null,
    live: feed.live
      ? { id: feed.live.id, when: whenOf(feed.live.startsAt, now), topic: feed.live.title }
      : null,
    recording: feed.recording
      ? {
          id: feed.recording.id,
          date: dayOf(feed.recording.recordedAt),
          title: feed.recording.title,
          minutes: feed.recording.minutes,
        }
      : null,
    assignments: feed.assignments.map((a) => toClassAssignment(a, now)),
    materials: feed.materials.map((m) => ({
      id: m.id,
      kind: m.kind,
      title: m.title,
      size: m.size,
    })),
  };
}

export function toAssignmentDetail(a: StudentAssignment, now: Date): AssignmentDetail {
  const s = a.submission;
  return {
    id: a.id,
    classId: a.classId,
    className: a.className,
    title: a.title,
    description: a.description,
    due: whenOf(a.dueAt, now),
    status: statusOf(a),
    topic: a.topic,
    attachment: a.attachment ?? null,
    submission: s?.submittedAt ? { sentAt: whenOf(s.submittedAt, now), photos: s.photos } : null,
    feedback:
      s?.state === 'checked' && s.grade
        ? {
            teacher: a.teacher.name,
            initials: a.teacher.initials,
            time: whenOf(s.gradedAt ?? s.submittedAt ?? a.dueAt, now),
            score: s.grade.score,
            max: s.grade.max,
            text: s.comment,
          }
        : null,
  };
}

/** A class chat's messages; an answer names whom it answers. */
export function toChatMessages(thread: ChatThreadDetail): ChatMessage[] {
  const byId = new Map(thread.messages.map((m) => [m.id, m]));
  return thread.messages.map((m) => {
    const replyTo = m.replyToId ? byId.get(m.replyToId)?.author?.name : undefined;
    return {
      id: m.id,
      author: m.author?.name ?? '',
      initials: m.author?.initials ?? '',
      role: m.author?.role === 'teacher' ? 'teacher' : 'student',
      ...(m.mine ? { mine: true } : {}),
      text: m.text,
      time: clockOf(m.at),
      ...(replyTo ? { replyTo } : {}),
    };
  });
}

export function toLiveSession(live: LiveLesson, cls: WorldSummary, studentId: string): LiveSession {
  const end = new Date(Date.parse(live.startsAt) + live.minutes * 60_000).toISOString();
  const mine = live.room.participants.find((p) => p.personId === studentId);
  return {
    id: live.id,
    classId: live.classId,
    title: live.title,
    teacher: cls.teacher.name,
    initials: cls.teacher.initials,
    className: cls.shortName,
    time: `${clockOf(live.startsAt)}–${clockOf(end)}`,
    participants: live.room.present,
    unreadChat: live.room.chatUnread,
    network: mine?.state === 'weak' ? 'weak' : 'good',
    board: { lines: live.board },
    source: live.source,
  };
}

/** The class a join code opens, as the join form shows it. */
export const toJoinPreview = (p: ClassPreview): ClassSummary => ({
  id: p.id,
  short: p.name.split(' · ')[0] ?? p.name,
  name: p.name,
  teacherId: p.teacher.id,
  teacher: p.teacher.name,
  teacherInitials: p.teacher.initials,
  students: p.students,
  unread: 0,
  newMessages: 0,
  newAnnouncements: 0,
  nextAssignment: null,
  nextLive: null,
  jar: { percent: 0, done: 0, goal: 1, mine: 0 },
});

/** Linked parents, and parents who typed the student's code and wait for an answer. */
export function toParents(me: MeResponse): {
  links: ParentLinkView[];
  requests: ParentRequest[];
} {
  const view = (p: MeResponse['parents'][number]) => ({
    id: p.parentId,
    name: p.name,
    relation: p.relation,
  });
  return {
    links: me.parents
      .filter((p) => p.status === 'active')
      .map((p) => ({ ...view(p), since: dayOf(p.since) })),
    requests: me.parents.filter((p) => p.status === 'requested').map(view),
  };
}
