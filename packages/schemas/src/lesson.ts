import { z } from 'zod';

/**
 * Whiteboard lesson script: what to draw and what to say, step by step.
 * Coordinates are in a 1920×1080 board space. Timing is NOT in the script: each step lasts
 * as long as its narration audio (or an estimate), and drawing is spread across it.
 */

export const lessonColorSchema = z.enum(['chalk', 'yellow', 'pink', 'blue', 'green', 'orange']);

const pointSchema = z.object({ x: z.number(), y: z.number() });
const idSchema = z.string().regex(/^[a-z0-9-]+$/);

export const lessonActionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('write'),
    id: idSchema,
    /** Handwritten text. `^x` writes x as a superscript: "(a + b)^2". */
    text: z.string().min(1),
    at: pointSchema,
    size: z.number().positive(),
    color: lessonColorSchema,
    align: z.enum(['left', 'center']).default('left'),
  }),
  z.object({
    type: z.literal('line'),
    id: idSchema,
    from: pointSchema,
    to: pointSchema,
    color: lessonColorSchema,
  }),
  z.object({
    type: z.literal('rect'),
    id: idSchema,
    at: pointSchema,
    width: z.number().positive(),
    height: z.number().positive(),
    color: lessonColorSchema,
  }),
  /** Chalk hatching over an area, revealed left to right. */
  z.object({
    type: z.literal('fill'),
    id: idSchema,
    at: pointSchema,
    width: z.number().positive(),
    height: z.number().positive(),
    color: lessonColorSchema,
  }),
  /** Underlines an earlier `write` action. */
  z.object({
    type: z.literal('underline'),
    id: idSchema,
    target: idSchema,
    color: lessonColorSchema,
  }),
]);

export const lessonStepSchema = z.object({
  id: idSchema,
  /** Spoken text in Azerbaijani, written as it should be read aloud ("a kvadrat", not "a²"). */
  narration: z.string().min(1),
  actions: z.array(lessonActionSchema),
});

export const lessonScriptSchema = z.object({
  version: z.literal(1),
  topic: z.object({ number: z.string(), title: z.string().min(1) }),
  /** Every lesson cites the textbook pages it is built from. */
  source: z.object({
    title: z.string().min(1),
    printedPages: z.array(z.number().int().positive()).min(1),
  }),
  theme: z.enum(['blackboard', 'whiteboard']),
  steps: z.array(lessonStepSchema).min(1),
});
