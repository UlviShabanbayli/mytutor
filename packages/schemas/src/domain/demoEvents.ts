import { z } from 'zod';
import { studyGoalSchema } from '../account';
import { askQuestionSchema, solutionStepSchema } from './ask';
import { assignmentSchema } from './assignments';
import { classGroupSchema, materialSchema, schoolClassSchema } from './classes';
import { dateTimeSchema } from './people';

/**
 * Shared demo events. The demo server stays stateless: a write (a grade, a message, a link) is
 * an event appended to a log kept on the device, one log per persona. The API (`POST
 * /v1/query`) and the app's offline fallback answer every query with the log applied, so every
 * role on one device sees the change.
 */

const base = { id: z.string().min(1), at: dateTimeSchema };
const id = z.string().min(1);

export const demoEventSchema = z.discriminatedUnion('type', [
  /** Teacher: a new assignment for a class. */
  z.object({ ...base, type: z.literal('assignment.created'), assignment: assignmentSchema }),
  /** Student: hands in an assignment. */
  z.object({
    ...base,
    type: z.literal('assignment.submitted'),
    assignmentId: id,
    studentId: id,
  }),
  /** Teacher: grades a student's work. */
  z.object({
    ...base,
    type: z.literal('assignment.graded'),
    assignmentId: id,
    studentId: id,
    score: z.number().nonnegative(),
    outOf: z.number().positive(),
    comment: z.string().optional(),
  }),
  /** Any role: a message in a thread. */
  z.object({
    ...base,
    type: z.literal('message.sent'),
    threadId: id,
    fromPersonId: id,
    text: z.string().trim().min(1),
    /** The message in the same thread this one answers. */
    replyToId: id.optional(),
  }),
  /** Any role: read a thread up to now (the other side sees "Oxundu"). */
  z.object({ ...base, type: z.literal('thread.read'), threadId: id, readerId: id }),
  /** Student: a photo question. */
  z.object({ ...base, type: z.literal('ask.sent'), question: askQuestionSchema }),
  /** Teacher: approves (or edits) the AI's answer to a question. */
  z.object({
    ...base,
    type: z.literal('ask.answered'),
    questionId: id,
    teacherId: id,
    note: z.string().optional(),
    /** The teacher's steps when they changed the AI's (edited ones marked). */
    steps: z.array(solutionStepSchema).min(1).optional(),
    /** The topic the teacher linked the question to, when it differs. */
    topicId: id.optional(),
  }),
  /** Student: takes back a question no one has answered yet. */
  z.object({ ...base, type: z.literal('ask.cancelled'), questionId: id, studentId: id }),
  /** Student: joins or leaves a class. */
  z.object({ ...base, type: z.literal('class.joined'), classId: id, studentId: id }),
  z.object({ ...base, type: z.literal('class.left'), classId: id, studentId: id }),
  /** Teacher: removes a student from a class (and from its groups). */
  z.object({ ...base, type: z.literal('member.removed'), classId: id, studentId: id }),
  /** Teacher: opens a new class (with its join code and chat). */
  z.object({ ...base, type: z.literal('class.created'), class: schoolClassSchema }),
  /** Teacher: a note to the whole class. */
  z.object({
    ...base,
    type: z.literal('announcement.posted'),
    classId: id,
    authorId: id,
    text: z.string().trim().min(1),
  }),
  /** Teacher: creates or changes a group of a class. */
  z.object({ ...base, type: z.literal('group.saved'), classId: id, group: classGroupSchema }),
  /** Teacher: mutes or unmutes a student in the class chat. */
  z.object({
    ...base,
    type: z.literal('member.muted'),
    classId: id,
    studentId: id,
    muted: z.boolean(),
  }),
  /** Teacher: opens or closes the class chat to students. */
  z.object({ ...base, type: z.literal('class.chatSet'), classId: id, open: z.boolean() }),
  /** Teacher: saves a material (a draft, sent to classes or to the catalogue's review). */
  z.object({ ...base, type: z.literal('material.saved'), material: materialSchema }),
  /** Parent: links to a child (with the child's code) or stops following. */
  z.object({ ...base, type: z.literal('child.linked'), parentId: id, childId: id }),
  z.object({ ...base, type: z.literal('child.unlinked'), parentId: id, childId: id }),
  /** Parent: approves or declines the account of a child under 13. */
  z.object({
    ...base,
    type: z.literal('consent.decided'),
    parentId: id,
    childId: id,
    approved: z.boolean(),
  }),
  /** Any role: a notification was opened. */
  z.object({ ...base, type: z.literal('notification.read'), notificationId: id }),
  /** Student: chooses what to study for (the exam area follows it). */
  z.object({ ...base, type: z.literal('exam.goalSet'), goal: studyGoalSchema }),
]);

export const DEMO_EVENT_TYPES = demoEventSchema.options.map((o) => o.shape.type.value);

/** At most this many events go with one query (the app's log is trimmed to it). */
export const MAX_DEMO_EVENTS = 200;
/** At most this many bytes in one `POST /v1/query` body. */
export const MAX_DEMO_QUERY_BYTES = 256 * 1024;

/** `POST /v1/query`: answer `GET path` with the events applied. */
export const demoQuerySchema = z.object({
  path: z
    .string()
    .regex(/^\/v1\//, 'A /v1 path')
    .refine((p) => !p.startsWith('/v1/query'), 'Not the query route itself'),
  events: z.array(demoEventSchema).max(MAX_DEMO_EVENTS),
});
