import type { ChildOverview, NotificationPrefs } from '@mytutor/types';

/**
 * View shapes of the parent area. The data comes from the demo world (`/v1/parent/*`, domain
 * types in `@mytutor/types`); `features/parent/map.ts` turns it into these.
 */

/** This week at a glance on a child's card, and whether the parent has opened the report. */
export type ChildWeek = NonNullable<ChildOverview['week']> & {
  /** This week's report notification is still unread. */
  reportIsNew: boolean;
};

/** A child as the parent's screens show it. */
export type ChildView = Omit<ChildOverview, 'week'> & { week: ChildWeek | null };

/** Where an assignment stands for the parent; `late` is derived (due passed, nothing in). */
export type AssignmentItemState = 'not_started' | 'in_progress' | 'late' | 'submitted' | 'checked';

export type AssignmentItem = {
  id: string;
  title: string;
  dueAt: string;
  state: AssignmentItemState;
  progress: { done: number; total: number } | null;
  lateDays: number;
  submittedAt: string | null;
  onTime: boolean;
  /** A mock's grade is shown as a percent, every other grade as points. */
  score: { kind: 'points'; value: number; max: number } | { kind: 'percent'; value: number } | null;
};

/** A teacher's note to the whole class ("Sinif qeydi · 7B"). */
export type ClassNote = { id: string; className: string; text: string; at: string };

/** A message of the parent's conversation with a teacher. */
export type ThreadMessage = {
  id: string;
  from: 'teacher' | 'me';
  text: string;
  at: string;
  status: 'sent' | 'read';
  reported: boolean;
};

/** The teacher a conversation is with, and whose teacher. */
export type TeacherContact = {
  threadId: string;
  name: string;
  firstName: string;
  /** "7B · Riyaziyyat" */
  classLabel: string;
  childName: string;
};

export type Conversation = TeacherContact & {
  last: { text: string; at: string; fromMe: boolean } | null;
  latestNote: ClassNote | null;
  unread: number;
};

export type Thread = TeacherContact & { notes: ClassNote[]; messages: ThreadMessage[] };

export type ParentNotification = { id: string; at: string; read: boolean } & (
  | { kind: 'weekly_report'; childId: string; childName: string }
  | { kind: 'teacher_message'; threadId: string; teacherName: string }
);

/** What a parent can switch notifications on and off for. */
export type NotificationKind = keyof NotificationPrefs;

/** The parent's own name and masked number ("Mən" header, the first greeting). */
export type ParentSelf = { name: string; phoneMasked: string };
