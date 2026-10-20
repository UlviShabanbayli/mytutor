import type { z } from 'zod';
import type {
  admissionGroupSchema,
  examKindSchema,
  onboardingProfileSchema,
  roleSchema,
  studyGoalSchema,
  curriculumSchema,
  curriculumEntrySchema,
  curriculumInputSchema,
  curriculumTextbookSchema,
  createCurriculumResponseSchema,
  lessonEntrySchema,
  lessonParagraphSchema,
  lessonSectionSchema,
  lessonTextEstimateSchema,
  lessonTextSchema,
  topicLessonSchema,
  answerPartSchema,
  answerSchema,
  answerSourceSchema,
  answersDocumentSchema,
  extractedAnswerSchema,
  subjectIdSchema,
  testBookEntrySchema,
  testBookSchema,
  testPageBandSchema,
  testPageLayoutSchema,
  testPagesSchema,
  pageReadingSchema,
  questionTopicLinkSchema,
  testAnswerSchema,
  testQuestionSchema,
  testQuestionsDocumentSchema,
  topicCatalogueSchema,
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
  createStandardSetResponseSchema,
  standardSetEntrySchema,
  standardSetInputSchema,
  standardLinksInputSchema,
  itemReviewSchema,
  blockReviewSchema,
  topicReviewSchema,
  topicReviewInputSchema,
  reviewDecisionSchema,
  knowledgeSummarySchema,
  reviewProgressSchema,
  standardLinksSchema,
  standardSetSchema,
  officialStandardSchema,
  deleteBookResponseSchema,
  extractSourceResponseSchema,
  extractedItemSchema,
  healthResponseSchema,
  itemStandardLinkSchema,
  knowledgeCheckSchema,
  knowledgeDocumentSchema,
  knowledgeExtractionSchema,
  knowledgeItemSchema,
  knowledgeItemTypeSchema,
  knowledgeSourceIdSchema,
  knowledgeSourceRefSchema,
  knowledgeStatusSchema,
  lessonActionSchema,
  lessonColorSchema,
  lessonScriptSchema,
  lessonStepSchema,
  localeSchema,
  optionKeySchema,
  otpCodeSchema,
  phoneNumberSchema,
  practiceTestSchema,
  questionTypeSchema,
  mathSvgSchema,
  publishedTestsSchema,
  purgeTrashResponseSchema,
  questionSchema,
  restoreBookResponseSchema,
  savedResponseSchema,
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
export type QuestionType = z.output<typeof questionTypeSchema>;
export type MathSvg = z.output<typeof mathSvgSchema>;
export type PublishedTests = z.output<typeof publishedTestsSchema>;

export type TextbookBlockKind = z.output<typeof textbookBlockKindSchema>;
export type TextbookTopic = z.output<typeof textbookTopicSchema>;
export type TextbookBlock = z.output<typeof textbookBlockSchema>;
export type TextbookUnit = z.output<typeof textbookUnitSchema>;
export type TextbookStructure = z.output<typeof textbookStructureSchema>;

/** The student's answers in one test session, keyed by question id: an option key or a typed number. */
export type TestAnswers = Record<string, string>;

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
export type LessonColor = z.output<typeof lessonColorSchema>;
export type LessonAction = z.output<typeof lessonActionSchema>;
export type LessonStep = z.output<typeof lessonStepSchema>;
export type LessonScript = z.output<typeof lessonScriptSchema>;
export type OfficialStandard = z.output<typeof officialStandardSchema>;
export type StandardSetInput = z.output<typeof standardSetInputSchema>;
export type StandardSet = z.output<typeof standardSetSchema>;
export type StandardSetEntry = z.output<typeof standardSetEntrySchema>;
export type ItemStandardLink = z.output<typeof itemStandardLinkSchema>;
export type StandardLinks = z.output<typeof standardLinksSchema>;
export type StandardLinksInput = z.output<typeof standardLinksInputSchema>;
export type CreateStandardSetResponse = z.output<typeof createStandardSetResponseSchema>;
export type SavedResponse = z.output<typeof savedResponseSchema>;
export type PurgeTrashResponse = z.output<typeof purgeTrashResponseSchema>;
export type ReviewDecision = z.output<typeof reviewDecisionSchema>;
export type ItemReview = z.output<typeof itemReviewSchema>;
export type BlockReview = z.output<typeof blockReviewSchema>;
export type TopicReview = z.output<typeof topicReviewSchema>;
export type TopicReviewInput = z.output<typeof topicReviewInputSchema>;
export type KnowledgeSummary = z.output<typeof knowledgeSummarySchema>;
export type ReviewProgress = z.output<typeof reviewProgressSchema>;
export type Curriculum = z.output<typeof curriculumSchema>;
export type CurriculumEntry = z.output<typeof curriculumEntrySchema>;
export type CurriculumInput = z.output<typeof curriculumInputSchema>;
export type CurriculumTextbook = z.output<typeof curriculumTextbookSchema>;
export type CreateCurriculumResponse = z.output<typeof createCurriculumResponseSchema>;
export type LessonParagraph = z.output<typeof lessonParagraphSchema>;
export type LessonSection = z.output<typeof lessonSectionSchema>;
export type LessonText = z.output<typeof lessonTextSchema>;
export type TopicLesson = z.output<typeof topicLessonSchema>;
export type LessonEntry = z.output<typeof lessonEntrySchema>;
export type LessonTextEstimate = z.output<typeof lessonTextEstimateSchema>;
export type AnswerPart = z.output<typeof answerPartSchema>;
export type ExtractedAnswer = z.output<typeof extractedAnswerSchema>;
export type Answer = z.output<typeof answerSchema>;
export type AnswerSource = z.output<typeof answerSourceSchema>;
export type AnswersDocument = z.output<typeof answersDocumentSchema>;
export type SubjectId = z.output<typeof subjectIdSchema>;
export type TestBook = z.output<typeof testBookSchema>;
export type TestBookEntry = z.output<typeof testBookEntrySchema>;
export type TestPageBand = z.output<typeof testPageBandSchema>;
export type TestPageLayout = z.output<typeof testPageLayoutSchema>;
export type TestPages = z.output<typeof testPagesSchema>;
export type PageReading = z.output<typeof pageReadingSchema>;
export type QuestionTopicLink = z.output<typeof questionTopicLinkSchema>;
export type TestAnswer = z.output<typeof testAnswerSchema>;
export type TestQuestion = z.output<typeof testQuestionSchema>;
export type TestQuestionsDocument = z.output<typeof testQuestionsDocumentSchema>;
export type TopicCatalogue = z.output<typeof topicCatalogueSchema>;

export type Role = z.output<typeof roleSchema>;
export type ExamKind = z.output<typeof examKindSchema>;
export type AdmissionGroup = z.output<typeof admissionGroupSchema>;
export type StudyGoal = z.output<typeof studyGoalSchema>;
export type OnboardingProfile = z.output<typeof onboardingProfileSchema>;

export * from './domain';
