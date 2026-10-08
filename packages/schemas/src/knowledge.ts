import { z } from 'zod';
import { sourceRegionSchema } from './source';

/**
 * Knowledge layer: what a topic teaches, as stated by the textbook. Every element points back
 * to source-layer IDs (block / line / figure); pages and boxes are resolved from the source by
 * code, never written by the model.
 *
 * Two shapes: `knowledgeExtractionSchema` is what the model returns (versioned with the
 * prompt); `knowledgeDocumentSchema` is the stored, validated document.
 */

/** 2: the model returns flat items (`knowledgeExtractionSchema`), converted to `ExtractedItem` in code. */
export const KNOWLEDGE_EXTRACTION_VERSION = 2;

export const knowledgeItemTypeSchema = z.enum([
  'definition', // a stated definition of a concept
  'rule', // a rule or property stated in words ("İki ədəd cəminin kvadratı bərabərdir: …")
  'formula', // a named or boxed formula / identity
  'worked_example', // NÜMUNƏ with its solution
  'exercise', // a numbered task (Çalışma / Məsələ həlli)
  'question', // an open prompt (Araşdırma-müzakirə, Fikirləş!)
  'figure', // a drawing the explanation relies on
  'term', // a term the book introduces or emphasises
  'prerequisite', // earlier knowledge the book says it builds on
]);

/** Where a claim comes from, by source-layer ID. The model may only use IDs it was given. */
export const knowledgeSourceIdSchema = z.object({
  blockId: z.string(),
  lineIds: z.array(z.string()),
  figureId: z.string().nullable(),
});

const mathText = z.object({
  /** Words as printed (Azerbaijani). */
  text: z.string().nullable(),
  /** Mathematics as LaTeX, transcribed from the image. */
  latex: z.string().nullable(),
});

/** Fields every item has, regardless of type. */
const extractedBase = {
  ref: z.string().describe('Short unique id within this response, e.g. "k1"'),
  origin: z
    .enum(['textbook', 'derived'])
    .describe('"textbook" = printed in the book; "derived" = your structuring/inference from it'),
  sources: z.array(knowledgeSourceIdSchema).min(1),
  readFrom: z
    .enum(['image', 'text'])
    .describe('Whether the content was read from the crop image or the text layer'),
};

export const extractedItemSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('definition'),
    ...extractedBase,
    concept: z.string(),
    statement: z.string(),
  }),
  z.object({
    type: z.literal('rule'),
    ...extractedBase,
    statement: z.string(),
    latex: z.string().nullable(),
  }),
  z.object({
    type: z.literal('formula'),
    ...extractedBase,
    name: z.string().nullable().describe('Name as printed, e.g. "Cəmin kvadratı düsturu"'),
    latex: z.string(),
    spoken: z.string().describe('How to read it aloud in Azerbaijani (derived)'),
  }),
  z.object({
    type: z.literal('worked_example'),
    ...extractedBase,
    label: z.string().describe('Exactly the source block label, e.g. "NÜMUNƏ 1."'),
    problem: mathText,
    steps: z.array(mathText),
    explanation: z.string().nullable().describe('The "Açıqlama" text when the book has one'),
  }),
  z.object({
    type: z.literal('exercise'),
    ...extractedBase,
    number: z.string().describe('Exactly the source block number'),
    instruction: z.string(),
    items: z.array(
      z.object({ label: z.string(), text: z.string().nullable(), latex: z.string().nullable() }),
    ),
  }),
  z.object({
    type: z.literal('question'),
    ...extractedBase,
    text: z.string(),
    latex: z.string().nullable(),
  }),
  z.object({
    type: z.literal('figure'),
    ...extractedBase,
    description: z.string().describe('What the drawing shows (derived)'),
    labels: z.array(z.string()),
  }),
  z.object({ type: z.literal('term'), ...extractedBase, term: z.string(), context: z.string() }),
  z.object({ type: z.literal('prerequisite'), ...extractedBase, statement: z.string() }),
]);

// Wire shapes use "" and [] instead of null: the API allows at most 16 union-typed (incl.
// nullable) parameters per schema, and a flat item for nine types needs more than that.
const wireMath = z.object({ text: z.string(), latex: z.string() });

/**
 * What the model returns for one item: a single flat shape instead of the nine-way union above
 * (which compiles to a structured-output grammar the API rejects as too large). Fields that do
 * not apply to the item's type are "" or []; code converts the item to `ExtractedItem`.
 */
export const wireItemSchema = z.object({
  type: knowledgeItemTypeSchema,
  ref: extractedBase.ref,
  origin: extractedBase.origin,
  sources: z
    .array(z.object({ blockId: z.string(), lineIds: z.array(z.string()), figureId: z.string() }))
    .min(1)
    .describe('figureId "" when no figure is cited'),
  readFrom: extractedBase.readFrom,
  concept: z.string().describe('definition'),
  statement: z.string().describe('definition, rule, prerequisite'),
  latex: z.string().describe('rule, formula (required), question'),
  name: z.string().describe('formula: caption as printed, e.g. "Cəmin kvadratı düsturu"'),
  spoken: z.string().describe('formula: how to read it aloud in Azerbaijani'),
  label: z.string().describe('worked_example: exactly the source block label'),
  problem: wireMath.describe('worked_example'),
  steps: z.array(wireMath).describe('worked_example'),
  explanation: z.string().describe('worked_example: the "Açıqlama" text'),
  number: z.string().describe('exercise: exactly the source block number'),
  instruction: z.string().describe('exercise'),
  items: z
    .array(z.object({ label: z.string(), text: z.string(), latex: z.string() }))
    .describe('exercise: sub-items a, b, c, …'),
  text: z.string().describe('question'),
  description: z.string().describe('figure: what the drawing shows'),
  labels: z.array(z.string()).describe('figure'),
  term: z.string().describe('term'),
  context: z.string().describe('term'),
});

export const knowledgeExtractionSchema = z.object({
  items: z.array(wireItemSchema),
});

/** Image check answer for one claim, from an independent verification call. */
export const verificationVerdictSchema = z.object({
  ref: z.string(),
  verdict: z.enum(['match', 'mismatch', 'not_found']),
  /** What is actually printed, when it differs. */
  correction: z.string().nullable(),
});
export const knowledgeVerificationSchema = z.object({
  verdicts: z.array(verificationVerdictSchema),
});

// ---- stored document ----

export const knowledgeStatusSchema = z.enum(['textbook', 'derived', 'unverified']);

export const knowledgeCheckSchema = z.object({
  name: z.enum([
    'source_ids',
    'block_kind',
    'text_grounding',
    'latex_syntax',
    'identity',
    'image_verification',
  ]),
  result: z.enum(['pass', 'fail', 'skip']),
  detail: z.string().nullable(),
});

/** A source reference with everything resolved: IDs from the model, location from the source layer. */
export const knowledgeSourceRefSchema = knowledgeSourceIdSchema.extend({
  regions: z.array(sourceRegionSchema).min(1),
  crops: z.array(z.string()),
});

export const knowledgeItemSchema = z.object({
  id: z.string(),
  type: knowledgeItemTypeSchema,
  status: knowledgeStatusSchema,
  claimedOrigin: z.enum(['textbook', 'derived']),
  readFrom: z.enum(['image', 'text']),
  sources: z.array(knowledgeSourceRefSchema).min(1),
  /** Type-specific content, as extracted (validated against `extractedItemSchema`). */
  content: z.record(z.string(), z.unknown()),
  checks: z.array(knowledgeCheckSchema),
});

export const aiCallSchema = z.object({
  id: z.string(),
  stage: z.enum(['extract', 'verify']),
  model: z.string(),
  promptVersion: z.string(),
  blockIds: z.array(z.string()),
  inputTokens: z.number().int(),
  cacheCreationTokens: z.number().int(),
  cacheReadTokens: z.number().int(),
  outputTokens: z.number().int(),
  costUsd: z.number(),
  cached: z.boolean().describe('Served from the local result cache: no API call was made'),
});

export const knowledgeDocumentSchema = z.object({
  schemaVersion: z.literal(1),
  extractionVersion: z.number().int(),
  topic: z.object({ number: z.string(), title: z.string() }),
  source: z.object({ bookSha256: z.string(), parserVersion: z.string(), sourceSha256: z.string() }),
  prompts: z.object({
    extract: z.string(),
    verify: z.string(),
    extractSha256: z.string(),
    verifySha256: z.string(),
  }),
  createdAt: z.string(),
  items: z.array(knowledgeItemSchema),
  aiCalls: z.array(aiCallSchema),
  summary: z.object({
    textbook: z.number().int(),
    derived: z.number().int(),
    unverified: z.number().int(),
    imageBasedFormulas: z.array(z.string()),
    /** Model items dropped because their fields did not fit their type. */
    rejected: z.number().int(),
    costUsd: z.number(),
  }),
});
