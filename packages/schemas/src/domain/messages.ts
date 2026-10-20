import { z } from 'zod';
import { roleSchema } from '../account';
import { dateTimeSchema } from './people';

/**
 * Chat threads (architecture P5–P6): a class chat, or a teacher's conversation with a parent or a
 * student. Unread counts are derived per reader from `readAt`; messages are never deleted, only
 * reported.
 */

export const THREAD_KINDS = ['class', 'parent', 'student'] as const;
export const threadKindSchema = z.enum(THREAD_KINDS);

export const chatThreadSchema = z.object({
  id: z.string().min(1),
  kind: threadKindSchema,
  /** The class of a class chat. */
  classId: z.string().nullable(),
  /** Everyone in a direct conversation (a class chat is its roster and teacher). */
  memberIds: z.array(z.string()),
  /** The child a parent–teacher conversation is about. */
  childId: z.string().nullable(),
  /** When each reader last read the thread. */
  readAt: z.record(z.string(), dateTimeSchema),
});

export const chatMessageSchema = z.object({
  id: z.string().min(1),
  threadId: z.string().min(1),
  /** Null for a note the app writes itself. */
  authorId: z.string().nullable(),
  text: z.string().min(1),
  at: dateTimeSchema,
  /** The message this one answers. */
  replyToId: z.string().nullable(),
  reported: z.boolean(),
});

/** A message as one reader sees it. */
export const chatMessageViewSchema = chatMessageSchema.extend({
  author: z
    .object({
      id: z.string().min(1),
      name: z.string().min(1),
      initials: z.string().min(1),
      role: roleSchema,
    })
    .nullable(),
  mine: z.boolean(),
  /** Read by everyone else in the thread. */
  status: z.enum(['sent', 'read']),
});

/** A thread in one reader's list. */
export const chatThreadViewSchema = z.object({
  id: z.string().min(1),
  kind: threadKindSchema,
  title: z.string().min(1),
  classId: z.string().nullable(),
  childId: z.string().nullable(),
  /** The child a parent–teacher conversation is about ("Nərmin Əliyeva"). */
  childName: z.string().nullable(),
  unread: z.number().int().nonnegative(),
  last: chatMessageViewSchema.nullable(),
});

/** GET /v1/messages/:id. */
export const chatThreadDetailSchema = chatThreadViewSchema.extend({
  messages: z.array(chatMessageViewSchema),
});
