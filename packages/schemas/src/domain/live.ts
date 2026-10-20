import { z } from 'zod';
import { dateTimeSchema } from './people';

/** A class's live lesson (architecture M5): the plan, and the room as it looks while it runs. */

export const boardLineSchema = z.object({
  text: z.string().min(1),
  tone: z.enum(['ink', 'honey']),
  size: z.enum(['lg', 'md']),
  indent: z.boolean().optional(),
});

export const LIVE_PARTICIPANT_STATES = ['speaking', 'muted', 'hand', 'weak'] as const;

export const liveParticipantSchema = z.object({
  personId: z.string().min(1),
  state: z.enum(LIVE_PARTICIPANT_STATES),
});

export const liveLessonSchema = z.object({
  id: z.string().min(1),
  classId: z.string().min(1),
  teacherId: z.string().min(1),
  topicId: z.string().min(1),
  title: z.string().min(1),
  startsAt: dateTimeSchema,
  minutes: z.number().int().positive(),
  /** The lesson is recorded; students can watch it again afterwards. */
  recorded: z.boolean(),
  board: z.array(boardLineSchema).min(1),
  /** The demo's room while the lesson runs: who is there, raised hands, unread chat. */
  room: z.object({
    present: z.number().int().nonnegative(),
    participants: z.array(liveParticipantSchema),
    hands: z.array(z.object({ personId: z.string().min(1), at: dateTimeSchema })),
    chatUnread: z.number().int().nonnegative(),
  }),
  source: z.string().min(1),
});
