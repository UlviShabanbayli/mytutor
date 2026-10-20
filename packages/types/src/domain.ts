import type { z } from 'zod';
import type {
  announcementSchema,
  askEventSchema,
  askQuestionSchema,
  askQuestionViewSchema,
  askQueueSchema,
  askStatusSchema,
  askUsageSchema,
  assignmentDueSchema,
  assignmentKindSchema,
  assignmentSchema,
  audienceSchema,
  badgeIdSchema,
  badgeSchema,
  bankQuestionSchema,
  boardLineSchema,
  chainLinkSchema,
  chatMessageSchema,
  chatMessageViewSchema,
  chatThreadDetailSchema,
  chatThreadSchema,
  chatThreadViewSchema,
  childAssignmentListSchema,
  childAssignmentSchema,
  childLinkSchema,
  childLinkStatusSchema,
  childOverviewSchema,
  classFeedSchema,
  classGroupSchema,
  classInsightsSchema,
  classMemberSchema,
  classPreviewSchema,
  classSummarySchema,
  comebackSchema,
  consentRequestSchema,
  courseTopicSchema,
  courseUnitSchema,
  crystalTopicSchema,
  curriculumResponseSchema,
  curriculumSubjectSchema,
  deadlineSchema,
  demoAccountSchema,
  demoPersonaSchema,
  demoWorldSchema,
  examPlanDaySchema,
  examPlanSchema,
  examPlanStepSchema,
  examStateSchema,
  examSubjectSchema,
  firstStepSchema,
  gradeSchema,
  hiveSchema,
  hiveTopicSchema,
  hiveUnitSchema,
  leaderboardEntrySchema,
  leaderboardSchema,
  leagueIdSchema,
  leagueRowSchema,
  leagueScopeSchema,
  leagueTableSchema,
  lessonExerciseSchema,
  lessonPageSchema,
  lessonVideoSchema,
  linkCodeSchema,
  liveLessonSchema,
  liveParticipantSchema,
  masteryLevelSchema,
  masteryMapSchema,
  matchStepSchema,
  materialSchema,
  meResponseSchema,
  mistakeGroupSchema,
  mistakeItemSchema,
  mockExamSchema,
  mockGroupSchema,
  mockListItemSchema,
  mockQuestionSchema,
  mockRunSchema,
  motivationSchema,
  notificationPrefsSchema,
  notificationSchema,
  pageRangeSchema,
  parentCodeLookupSchema,
  parentHomeSchema,
  parentLinkViewSchema,
  parentProfileSchema,
  parentRelationSchema,
  personRefSchema,
  personSchema,
  placementQuestionSchema,
  planFeatureSchema,
  planStepReasonSchema,
  planStepSchema,
  pointsSchema,
  rankIdSchema,
  rankSchema,
  recordingSchema,
  reportPageSchema,
  reviewCellSchema,
  reviewPlanSchema,
  rosterEntrySchema,
  schoolClassSchema,
  sessionStepSchema,
  shareCategorySchema,
  similarQuestionSchema,
  solutionStepSchema,
  studentActivitySchema,
  studentAssignmentSchema,
  studentPlanSchema,
  studentProfileSchema,
  studyLessonSchema,
  studyTestSchema,
  subjectProgressSchema,
  subjectReadinessSchema,
  submissionSchema,
  submissionStateSchema,
  submissionViewSchema,
  teacherAssignmentSchema,
  teacherClassDetailSchema,
  teacherClassViewSchema,
  teacherHomeSchema,
  teacherProfileSchema,
  teacherVerificationSchema,
  testScoreSchema,
  textbookChoiceSchema,
  textbookProgressSchema,
  textbookSchema,
  textbookSummarySchema,
  textbookVolumeSchema,
  todayResponseSchema,
  topicMaterialSchema,
  topicRefSchema,
  topicStepSchema,
  tutorListingSchema,
  unfinishedLessonSchema,
  unitProgressSchema,
  unitTestSchema,
  weakSpotSchema,
  weakSpotsReportSchema,
  weekOverviewSchema,
  weekReportSchema,
  workedExampleSchema,
  workedStepSchema,
  writtenStepSchema,
} from '@mytutor/schemas';

// Domain types of the app and the demo world, inferred from packages/schemas/src/domain.

export type DemoPersona = z.output<typeof demoPersonaSchema>;
export type DemoAccount = z.output<typeof demoAccountSchema>;
export type DemoWorld = z.output<typeof demoWorldSchema>;
export type Person = z.output<typeof personSchema>;
export type PersonRef = z.output<typeof personRefSchema>;
export type StudentPlan = z.output<typeof studentPlanSchema>;
export type RankId = z.output<typeof rankIdSchema>;
export type LeagueId = z.output<typeof leagueIdSchema>;
export type Points = z.output<typeof pointsSchema>;
export type StudentProfile = z.output<typeof studentProfileSchema>;
export type StudentActivity = z.output<typeof studentActivitySchema>;
export type TeacherVerification = z.output<typeof teacherVerificationSchema>;
export type TutorListing = z.output<typeof tutorListingSchema>;
export type TeacherProfile = z.output<typeof teacherProfileSchema>;
export type ParentProfile = z.output<typeof parentProfileSchema>;
export type ShareCategory = z.output<typeof shareCategorySchema>;
export type ParentRelation = z.output<typeof parentRelationSchema>;
export type ChildLinkStatus = z.output<typeof childLinkStatusSchema>;
export type ChildLink = z.output<typeof childLinkSchema>;
export type LinkCode = z.output<typeof linkCodeSchema>;

export type SchoolClass = z.output<typeof schoolClassSchema>;
export type ClassGroup = z.output<typeof classGroupSchema>;
export type ClassMember = z.output<typeof classMemberSchema>;
export type Announcement = z.output<typeof announcementSchema>;
export type Material = z.output<typeof materialSchema>;
export type Recording = z.output<typeof recordingSchema>;
export type ClassSummary = z.output<typeof classSummarySchema>;
export type ClassFeed = z.output<typeof classFeedSchema>;
export type ClassPreview = z.output<typeof classPreviewSchema>;
export type StudentAssignment = z.output<typeof studentAssignmentSchema>;

export type MasteryLevel = z.output<typeof masteryLevelSchema>;
export type MasteryMap = z.output<typeof masteryMapSchema>;
export type PageRange = z.output<typeof pageRangeSchema>;
export type CourseTopic = z.output<typeof courseTopicSchema>;
export type CourseUnit = z.output<typeof courseUnitSchema>;
export type TextbookVolume = z.output<typeof textbookVolumeSchema>;
export type Textbook = z.output<typeof textbookSchema>;
export type TextbookSummary = z.output<typeof textbookSummarySchema>;
export type TextbookChoice = z.output<typeof textbookChoiceSchema>;
export type CurriculumSubject = z.output<typeof curriculumSubjectSchema>;
export type CurriculumResponse = z.output<typeof curriculumResponseSchema>;
export type TopicStep = z.output<typeof topicStepSchema>;
export type TopicMaterial = z.output<typeof topicMaterialSchema>;
export type HiveTopic = z.output<typeof hiveTopicSchema>;
export type HiveUnit = z.output<typeof hiveUnitSchema>;
export type UnitTest = z.output<typeof unitTestSchema>;
export type Hive = z.output<typeof hiveSchema>;
export type PlacementQuestion = z.output<typeof placementQuestionSchema>;

export type PlanStepReason = z.output<typeof planStepReasonSchema>;
export type PlanStep = z.output<typeof planStepSchema>;
export type UnfinishedLesson = z.output<typeof unfinishedLessonSchema>;
export type AssignmentDue = z.output<typeof assignmentDueSchema>;
export type FirstStep = z.output<typeof firstStepSchema>;
export type Motivation = z.output<typeof motivationSchema>;
export type CrystalTopic = z.output<typeof crystalTopicSchema>;
export type Comeback = z.output<typeof comebackSchema>;
export type TodayResponse = z.output<typeof todayResponseSchema>;

export type LessonVideo = z.output<typeof lessonVideoSchema>;
export type LessonPage = z.output<typeof lessonPageSchema>;
export type WorkedStep = z.output<typeof workedStepSchema>;
export type WorkedExample = z.output<typeof workedExampleSchema>;
export type LessonExercise = z.output<typeof lessonExerciseSchema>;
export type StudyLesson = z.output<typeof studyLessonSchema>;
export type MatchStep = z.output<typeof matchStepSchema>;
export type WrittenStep = z.output<typeof writtenStepSchema>;
export type SessionStep = z.output<typeof sessionStepSchema>;
export type StudyTest = z.output<typeof studyTestSchema>;
export type ReviewCell = z.output<typeof reviewCellSchema>;
export type ReviewPlan = z.output<typeof reviewPlanSchema>;
export type MistakeItem = z.output<typeof mistakeItemSchema>;
export type MistakeGroup = z.output<typeof mistakeGroupSchema>;

export type AssignmentKind = z.output<typeof assignmentKindSchema>;
export type Audience = z.output<typeof audienceSchema>;
export type Assignment = z.output<typeof assignmentSchema>;
export type SubmissionState = z.output<typeof submissionStateSchema>;
export type Grade = z.output<typeof gradeSchema>;
export type Submission = z.output<typeof submissionSchema>;
export type SubmissionView = z.output<typeof submissionViewSchema>;
export type BoardLine = z.output<typeof boardLineSchema>;
export type LiveParticipant = z.output<typeof liveParticipantSchema>;
export type LiveLesson = z.output<typeof liveLessonSchema>;

export type AskStatus = z.output<typeof askStatusSchema>;
export type AskQueue = z.output<typeof askQueueSchema>;
export type AskEvent = z.output<typeof askEventSchema>;
export type SolutionStep = z.output<typeof solutionStepSchema>;
export type SimilarQuestion = z.output<typeof similarQuestionSchema>;
export type AskQuestion = z.output<typeof askQuestionSchema>;
export type AskQuestionView = z.output<typeof askQuestionViewSchema>;
export type AskUsage = z.output<typeof askUsageSchema>;

export type ChatThread = z.output<typeof chatThreadSchema>;
export type ChatMessage = z.output<typeof chatMessageSchema>;
export type ChatMessageView = z.output<typeof chatMessageViewSchema>;
export type ChatThreadView = z.output<typeof chatThreadViewSchema>;
export type ChatThreadDetail = z.output<typeof chatThreadDetailSchema>;
export type AppNotification = z.output<typeof notificationSchema>;
export type NotificationPrefs = z.output<typeof notificationPrefsSchema>;

export type LeagueScope = z.output<typeof leagueScopeSchema>;
export type LeagueRow = z.output<typeof leagueRowSchema>;
export type LeagueTable = z.output<typeof leagueTableSchema>;
export type Rank = z.output<typeof rankSchema>;
export type BadgeId = z.output<typeof badgeIdSchema>;
export type Badge = z.output<typeof badgeSchema>;

export type ExamSubject = z.output<typeof examSubjectSchema>;
export type SubjectReadiness = z.output<typeof subjectReadinessSchema>;
export type ExamPlanStep = z.output<typeof examPlanStepSchema>;
export type ExamPlanDay = z.output<typeof examPlanDaySchema>;
export type ExamPlan = z.output<typeof examPlanSchema>;
export type ChainLink = z.output<typeof chainLinkSchema>;
export type WeakSpot = z.output<typeof weakSpotSchema>;
export type WeakSpotsReport = z.output<typeof weakSpotsReportSchema>;
export type MockGroup = z.output<typeof mockGroupSchema>;
export type MockQuestion = z.output<typeof mockQuestionSchema>;
export type MockExam = z.output<typeof mockExamSchema>;
export type MockRun = z.output<typeof mockRunSchema>;
export type MockListItem = z.output<typeof mockListItemSchema>;
export type LeaderboardEntry = z.output<typeof leaderboardEntrySchema>;
export type Leaderboard = z.output<typeof leaderboardSchema>;
export type Deadline = z.output<typeof deadlineSchema>;
export type ExamState = z.output<typeof examStateSchema>;

export type TopicRef = z.output<typeof topicRefSchema>;
export type WeekReport = z.output<typeof weekReportSchema>;
export type ReportPage = z.output<typeof reportPageSchema>;
export type WeekOverview = z.output<typeof weekOverviewSchema>;
export type ChildOverview = z.output<typeof childOverviewSchema>;
export type UnitProgress = z.output<typeof unitProgressSchema>;
export type TestScore = z.output<typeof testScoreSchema>;
export type SubjectProgress = z.output<typeof subjectProgressSchema>;
export type ChildAssignment = z.output<typeof childAssignmentSchema>;
export type ChildAssignmentList = z.output<typeof childAssignmentListSchema>;
export type ConsentRequest = z.output<typeof consentRequestSchema>;
export type ParentHome = z.output<typeof parentHomeSchema>;
export type ParentCodeLookup = z.output<typeof parentCodeLookupSchema>;

export type TextbookProgress = z.output<typeof textbookProgressSchema>;
export type ParentLinkView = z.output<typeof parentLinkViewSchema>;
export type PlanFeature = z.output<typeof planFeatureSchema>;
export type MeResponse = z.output<typeof meResponseSchema>;

export type TeacherClassView = z.output<typeof teacherClassViewSchema>;
export type TeacherHome = z.output<typeof teacherHomeSchema>;
export type RosterEntry = z.output<typeof rosterEntrySchema>;
export type TeacherAssignment = z.output<typeof teacherAssignmentSchema>;
export type TeacherClassDetail = z.output<typeof teacherClassDetailSchema>;
export type BankQuestion = z.output<typeof bankQuestionSchema>;
export type ClassInsights = z.output<typeof classInsightsSchema>;
