import { z } from 'zod';
import { askQuestionSchema, askUsageSchema } from './ask';
import { assignmentSchema, submissionSchema } from './assignments';
import {
  announcementSchema,
  classMemberSchema,
  materialSchema,
  recordingSchema,
  schoolClassSchema,
} from './classes';
import { masteryMapSchema } from './course';
import { examStateSchema, mockExamSchema, mockRunSchema } from './exam';
import { curriculumResponseSchema, placementQuestionSchema } from './hive';
import { leagueRowSchema, badgeSchema } from './league';
import { studyLessonSchema, studyTestSchema } from './lessons';
import { liveLessonSchema } from './live';
import { chatMessageSchema, chatThreadSchema } from './messages';
import { notificationPrefsSchema, notificationSchema } from './notifications';
import { testScoreSchema, weekReportSchema } from './parent';
import {
  childLinkSchema,
  dateTimeSchema,
  demoPersonaSchema,
  linkCodeSchema,
  parentProfileSchema,
  personSchema,
  studentProfileSchema,
  teacherProfileSchema,
} from './people';
import { mistakeGroupSchema, reviewPlanSchema } from './practice';
import { bankQuestionSchema } from './teacher';
import { unfinishedLessonSchema } from './today';

/**
 * The whole demo world at one moment: every person, class and piece of progress the app shows,
 * consistent across the student, teacher and parent roles. Built by `@mytutor/demo-data`; the
 * API's routes and the app's offline fallback read it through the same selectors.
 */

/** What the student did: today, this week and the week before. */
export const studentActivitySchema = z.object({
  minutesToday: z.number().int().nonnegative(),
  todayCells: z.number().int().nonnegative(),
  todayAccuracy: z.number().int().min(0).max(100),
  lastActiveAt: dateTimeSchema.nullable(),
  /** The lesson the student left half-way; null when none. */
  unfinishedLesson: unfinishedLessonSchema.nullable(),
  /** Topics downloaded for offline use. */
  savedTopicIds: z.array(z.string()),
});

export const demoWorldSchema = z.object({
  now: dateTimeSchema,
  persona: demoPersonaSchema,
  /** The demo SMS code every demo phone "receives". */
  smsCode: z.string().regex(/^\d{6}$/),
  people: z.array(personSchema),
  student: studentProfileSchema,
  teacher: teacherProfileSchema,
  parent: parentProfileSchema,
  childLinks: z.array(childLinkSchema),
  codes: z.array(linkCodeSchema),
  classes: z.array(schoolClassSchema),
  members: z.array(classMemberSchema),
  announcements: z.array(announcementSchema),
  materials: z.array(materialSchema),
  recordings: z.array(recordingSchema),
  curriculum: curriculumResponseSchema,
  /** Mastery per student: the persona's and the class roster's. */
  mastery: z.record(z.string(), masteryMapSchema),
  activity: studentActivitySchema,
  lessons: z.array(studyLessonSchema),
  tests: z.array(studyTestSchema),
  placement: z.array(placementQuestionSchema),
  review: reviewPlanSchema,
  mistakes: z.array(mistakeGroupSchema),
  /** Recent test results per student. */
  testScores: z.record(z.string(), z.array(testScoreSchema)),
  assignments: z.array(assignmentSchema),
  submissions: z.array(submissionSchema),
  liveLessons: z.array(liveLessonSchema),
  askQuestions: z.array(askQuestionSchema),
  askUsage: askUsageSchema,
  bank: z.array(bankQuestionSchema),
  /** Questions most of a class got wrong, for the teacher's insights. */
  missed: z.array(
    z.object({
      classId: z.string().min(1),
      id: z.string().min(1),
      text: z.string().min(1),
      source: z.string().min(1),
      wrong: z.number().int().nonnegative(),
      total: z.number().int().positive(),
    }),
  ),
  threads: z.array(chatThreadSchema),
  messages: z.array(chatMessageSchema),
  notifications: z.array(notificationSchema),
  notificationPrefs: notificationPrefsSchema,
  /** This week's country league; the class table is derived from the roster. */
  countryLeague: z.array(leagueRowSchema),
  badges: z.array(badgeSchema),
  weekReports: z.record(z.string(), z.array(weekReportSchema)),
  mocks: z.array(mockExamSchema),
  /** The student's finished mocks. */
  mockRuns: z.array(mockRunSchema),
  /** The exam area for the student's goal (see `withExamGoal`). */
  exam: examStateSchema,
});
