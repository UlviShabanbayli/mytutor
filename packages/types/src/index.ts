import type { z } from 'zod';
import type {
  addBookResponseSchema,
  aiCallSchema,
  answerOptionSchema,
  apiErrorSchema,
  bboxSchema,
  bookMetaSchema,
  contentActionErrorCodeSchema,
  contentBookEntrySchema,
  contentIndexSchema,
  contentTopicEntrySchema,
  deleteBookResponseSchema,
  extractSourceResponseSchema,
  extractedItemSchema,
  healthResponseSchema,
  knowledgeCheckSchema,
  knowledgeDocumentSchema,
  knowledgeExtractionSchema,
  knowledgeItemSchema,
  knowledgeItemTypeSchema,
  knowledgeSourceIdSchema,
  knowledgeSourceRefSchema,
  knowledgeStatusSchema,
  localeSchema,
  optionKeySchema,
  otpCodeSchema,
  phoneNumberSchema,
  practiceTestSchema,
  questionSchema,
  restoreBookResponseSchema,
  sourceBlockKindSchema,
  sourceBlockSchema,
  sourceFigureSchema,
  sourceLineSchema,
  sourcePageSchema,
  sourceRefSchema,
  sourceRegionSchema,
  subjectSchema,
  textbookBlockKindSchema,
  textbookBlockSchema,
  textbookStructureSchema,
  textbookTopicSchema,
  textbookUnitSchema,
  topicSchema,
  topicSourceSchema,
  trashEntrySchema,
  verificationVerdictSchema,
  wireItemSchema,
} from '@mytutor/schemas';

// Types inferred from shared schemas. Domain types without a schema are declared here.
export type PhoneNumber = z.output<typeof phoneNumberSchema>;
export type OtpCode = z.output<typeof otpCodeSchema>;
export type Locale = z.output<typeof localeSchema>;
export type ApiError = z.output<typeof apiErrorSchema>;
export type HealthResponse = z.output<typeof healthResponseSchema>;

export type OptionKey = z.output<typeof optionKeySchema>;
export type SourceRef = z.output<typeof sourceRefSchema>;
export type AnswerOption = z.output<typeof answerOptionSchema>;
export type Question = z.output<typeof questionSchema>;
export type Subject = z.output<typeof subjectSchema>;
export type Topic = z.output<typeof topicSchema>;
export type PracticeTest = z.output<typeof practiceTestSchema>;

export type TextbookBlockKind = z.output<typeof textbookBlockKindSchema>;
export type TextbookTopic = z.output<typeof textbookTopicSchema>;
export type TextbookBlock = z.output<typeof textbookBlockSchema>;
export type TextbookUnit = z.output<typeof textbookUnitSchema>;
export type TextbookStructure = z.output<typeof textbookStructureSchema>;

/** The student's answers in one test session, keyed by question id. */
export type TestAnswers = Record<string, OptionKey>;

/** Outcome of a finished test session. */
export type TestResult = {
  testId: string;
  subjectId: string;
  title: string;
  correct: number;
  total: number;
  answers: TestAnswers;
  finishedAt: string;
};

export type BBox = z.output<typeof bboxSchema>;
export type SourceRegion = z.output<typeof sourceRegionSchema>;
export type SourcePage = z.output<typeof sourcePageSchema>;
export type SourceLine = z.output<typeof sourceLineSchema>;
export type SourceFigure = z.output<typeof sourceFigureSchema>;
export type SourceBlockKind = z.output<typeof sourceBlockKindSchema>;
export type SourceBlock = z.output<typeof sourceBlockSchema>;
export type TopicSource = z.output<typeof topicSourceSchema>;

export type KnowledgeItemType = z.output<typeof knowledgeItemTypeSchema>;
export type KnowledgeSourceId = z.output<typeof knowledgeSourceIdSchema>;
export type ExtractedItem = z.output<typeof extractedItemSchema>;
export type KnowledgeExtraction = z.output<typeof knowledgeExtractionSchema>;
export type WireItem = z.output<typeof wireItemSchema>;
export type VerificationVerdict = z.output<typeof verificationVerdictSchema>;
export type KnowledgeStatus = z.output<typeof knowledgeStatusSchema>;
export type KnowledgeCheck = z.output<typeof knowledgeCheckSchema>;
export type KnowledgeSourceRef = z.output<typeof knowledgeSourceRefSchema>;
export type KnowledgeItem = z.output<typeof knowledgeItemSchema>;
export type AiCall = z.output<typeof aiCallSchema>;
export type KnowledgeDocument = z.output<typeof knowledgeDocumentSchema>;

export type ContentTopicEntry = z.output<typeof contentTopicEntrySchema>;
export type ContentBookEntry = z.output<typeof contentBookEntrySchema>;
export type ContentIndex = z.output<typeof contentIndexSchema>;
export type BookMeta = z.output<typeof bookMetaSchema>;
export type ContentActionErrorCode = z.output<typeof contentActionErrorCodeSchema>;
export type AddBookResponse = z.output<typeof addBookResponseSchema>;
export type ExtractSourceResponse = z.output<typeof extractSourceResponseSchema>;
export type TrashEntry = z.output<typeof trashEntrySchema>;
export type DeleteBookResponse = z.output<typeof deleteBookResponseSchema>;
export type RestoreBookResponse = z.output<typeof restoreBookResponseSchema>;
