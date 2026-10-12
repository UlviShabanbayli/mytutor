import { z } from 'zod';
import { lessonColorSchema } from './lesson';

/**
 * A lesson scenario: what a whiteboard lesson teaches, scene by scene, written from a topic's
 * approved knowledge. It holds no coordinates and no timings: the lesson engine lays the board
 * out by rule (a number on a number line sits where its value says), so neither a model nor a
 * person places anything by hand. Every scene and every board element cites the knowledge
 * items it comes from, and a lesson is built only from approved items.
 */

export const SCENARIO_ID = /^scv_[a-z0-9]{10}$/;
const sceneIdSchema = z.string().regex(/^[a-z0-9-]+$/);
/** Knowledge item ids of the topic ("k023"). */
const sourcesSchema = z.array(z.string().regex(/^k\d{3}$/)).min(1);
const textSchema = z.string().trim().min(1);

export const scenarioNumberLineSchema = z.object({
  kind: z.literal('numberLine'),
  from: z.number(),
  to: z.number(),
  /** Equal parts each unit is divided into (4 for quarters). */
  parts: z.number().int().min(1).max(12),
  /** Labels under the line; integers are labelled by themselves unless listed here. */
  labels: z.array(z.object({ at: z.number(), text: textSchema })),
  /** Marked points, labelled above the line. */
  points: z.array(z.object({ at: z.number(), label: z.string(), color: lessonColorSchema })),
  sources: sourcesSchema,
});

export const scenarioElementSchema = z.discriminatedUnion('kind', [
  /** The scene's heading, centred. */
  z.object({ kind: z.literal('heading'), text: textSchema, sources: sourcesSchema }),
  /** Prose, wrapped to the board's width. */
  z.object({
    kind: z.literal('text'),
    text: textSchema,
    color: lessonColorSchema.default('chalk'),
    sources: sourcesSchema,
  }),
  /** One line of mathematics in board notation: "-3/4", "|a| = |-a|", "x^2". */
  z.object({
    kind: z.literal('math'),
    text: textSchema,
    color: lessonColorSchema.default('yellow'),
    sources: sourcesSchema,
  }),
  scenarioNumberLineSchema,
]);

export const scenarioSceneSchema = z.object({
  id: sceneIdSchema,
  /** Spoken Azerbaijani, written as it should be read aloud ("mənfi dörddə üç", not "-3/4"). */
  narration: textSchema,
  /** Starts the scene on a clean board (the engine also clears when the board is full). */
  clear: z.boolean().default(false),
  board: z.array(scenarioElementSchema),
  /** Knowledge items the narration states. */
  sources: sourcesSchema,
});

export const scenarioStatusSchema = z.enum(['draft', 'approved']);

export const lessonScenarioSchema = z
  .object({
    schemaVersion: z.literal(1),
    id: z.string().regex(SCENARIO_ID),
    /** Versions of one topic's lesson; a new version replaces the approved one only once approved. */
    version: z.number().int().positive(),
    status: scenarioStatusSchema,
    topic: z.object({ bookId: z.string(), number: z.string(), title: textSchema }),
    source: z.object({
      title: textSchema,
      printedPages: z.array(z.number().int().positive()).min(1),
    }),
    theme: z.enum(['blackboard', 'whiteboard']).default('blackboard'),
    /** Who wrote it: a model and how it was run, or an editor. */
    author: textSchema,
    createdAt: z.string(),
    scenes: z.array(scenarioSceneSchema).min(1),
  })
  .superRefine((scenario, ctx) => {
    const ids = new Set<string>();
    scenario.scenes.forEach((scene, i) => {
      if (ids.has(scene.id))
        ctx.addIssue({
          code: 'custom',
          message: `duplicate scene id "${scene.id}"`,
          path: ['scenes', i, 'id'],
        });
      ids.add(scene.id);
      scene.board.forEach((el, j) => {
        if (el.kind !== 'numberLine') return;
        const path = ['scenes', i, 'board', j];
        if (el.to <= el.from)
          ctx.addIssue({ code: 'custom', message: 'number line: to ≤ from', path });
        for (const at of [...el.labels, ...el.points].map((x) => x.at))
          if (at < el.from || at > el.to)
            ctx.addIssue({
              code: 'custom',
              message: `number line: ${at} outside ${el.from}…${el.to}`,
              path,
            });
      });
    });
  });

/** Every knowledge item a scenario cites, in order of first use. */
export function scenarioSources(scenario: z.output<typeof lessonScenarioSchema>): string[] {
  const all = scenario.scenes.flatMap((s) => [...s.sources, ...s.board.flatMap((e) => e.sources)]);
  return [...new Set(all)];
}
