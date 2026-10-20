import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import {
  announcementSchema,
  askQuestionViewSchema,
  askUsageSchema,
  chatThreadDetailSchema,
  chatThreadViewSchema,
  childAssignmentListSchema,
  classFeedSchema,
  classInsightsSchema,
  classPreviewSchema,
  classSummarySchema,
  curriculumResponseSchema,
  deadlineSchema,
  demoAccountSchema,
  examPlanSchema,
  examStateSchema,
  hiveSchema,
  leaderboardSchema,
  leagueTableSchema,
  liveLessonSchema,
  materialSchema,
  meResponseSchema,
  mistakeGroupSchema,
  mockExamSchema,
  mockListItemSchema,
  notificationPrefsSchema,
  notificationSchema,
  parentCodeLookupSchema,
  parentHomeSchema,
  placementQuestionSchema,
  reportPageSchema,
  reviewPlanSchema,
  studentAssignmentSchema,
  studyLessonSchema,
  studyTestSchema,
  subjectProgressSchema,
  submissionViewSchema,
  teacherAssignmentSchema,
  teacherClassDetailSchema,
  teacherHomeSchema,
  todayResponseSchema,
  weakSpotsReportSchema,
  bankQuestionSchema,
} from '@mytutor/schemas';
import { buildDemoWorld } from '../world';
import { answerFromWorld } from './answer';
import { DEMO_ROUTES } from './routes';

const NOW = new Date('2026-10-20T06:00:00.000Z');
const worlds = {
  nermin: buildDemoWorld({ now: NOW, persona: 'nermin' }),
  fresh: buildDemoWorld({ now: NOW, persona: 'fresh' }),
};

const GOAL = 'goal=graduation_9';

/** Every route with a request that finds something in Nərmin's world, and its schema. */
const CASES: [path: string, schema: z.ZodType][] = [
  ['/v1/me', meResponseSchema],
  ['/v1/today', todayResponseSchema],
  ['/v1/curriculum', curriculumResponseSchema],
  ['/v1/hive', hiveSchema],
  ['/v1/hive/placement', placementQuestionSchema.array()],
  ['/v1/hive/riyaziyyat-7', hiveSchema],
  ['/v1/lessons/riyaziyyat-7-4-3', studyLessonSchema],
  ['/v1/tests/test-riyaziyyat-7-u4', studyTestSchema],
  ['/v1/review', reviewPlanSchema],
  ['/v1/mistakes', mistakeGroupSchema.array()],
  [`/v1/exam?${GOAL}`, examStateSchema],
  [`/v1/exam/plan?${GOAL}`, examPlanSchema],
  [`/v1/exam/weak-spots?${GOAL}`, weakSpotsReportSchema],
  [`/v1/exam/mocks?${GOAL}`, mockListItemSchema.array()],
  ['/v1/exam/mocks/variant-2', mockExamSchema],
  [`/v1/exam/deadlines?${GOAL}`, deadlineSchema.array()],
  ['/v1/exam/leaderboard/country', leaderboardSchema],
  ['/v1/ask/questions', askQuestionViewSchema.array()],
  ['/v1/ask/questions/q-nermin-1', askQuestionViewSchema],
  ['/v1/ask/usage', askUsageSchema],
  ['/v1/classes', classSummarySchema.array()],
  ['/v1/classes/join/7b-math-4k2', classPreviewSchema],
  ['/v1/classes/7b', classFeedSchema],
  ['/v1/classes/7b/live', liveLessonSchema],
  ['/v1/assignments', studentAssignmentSchema.array()],
  ['/v1/assignments/hw-4-1', studentAssignmentSchema],
  ['/v1/messages', chatThreadViewSchema.array()],
  ['/v1/messages/chat-7b', chatThreadDetailSchema],
  ['/v1/notifications', notificationSchema.array()],
  ['/v1/league?scope=class', leagueTableSchema],
  ['/v1/parent', parentHomeSchema],
  ['/v1/parent/children/nermin/report?week=1', reportPageSchema],
  ['/v1/parent/children/nermin/progress', subjectProgressSchema.array()],
  ['/v1/parent/children/nermin/assignments', childAssignmentListSchema],
  ['/v1/parent/codes/K7Q42M', parentCodeLookupSchema],
  ['/v1/parent/messages', chatThreadViewSchema.array()],
  ['/v1/parent/messages/dm-lale-sebine', chatThreadDetailSchema],
  ['/v1/parent/notes', announcementSchema.array()],
  ['/v1/parent/notifications', notificationSchema.array()],
  ['/v1/parent/prefs', notificationPrefsSchema],
  ['/v1/teacher', teacherHomeSchema],
  ['/v1/teacher/classes/7b', teacherClassDetailSchema],
  ['/v1/teacher/assignments', teacherAssignmentSchema.array()],
  ['/v1/teacher/assignments/hw-4-1/submissions', submissionViewSchema.array()],
  ['/v1/teacher/inbox', askQuestionViewSchema.array()],
  ['/v1/teacher/inbox/q-nermin-1', askQuestionViewSchema],
  ['/v1/teacher/materials', materialSchema.array()],
  ['/v1/teacher/bank', bankQuestionSchema.array()],
  ['/v1/teacher/insights/7b', classInsightsSchema],
  ['/v1/teacher/live', liveLessonSchema.array()],
  ['/v1/teacher/messages', chatThreadViewSchema.array()],
  ['/v1/teacher/messages/dm-lale-orxan', chatThreadDetailSchema],
  ['/v1/teacher/notifications', notificationSchema.array()],
  ['/v1/demo/accounts', demoAccountSchema.array()],
];

const get = (path: string, persona: keyof typeof worlds = 'nermin') =>
  answerFromWorld(worlds[persona], path);

describe('demo routes', () => {
  it('cover every route of the table', () => {
    const tested = new Set(
      CASES.map(([path]) => {
        const bare = path.split('?')[0] ?? '';
        return DEMO_ROUTES.find((r) => {
          const a = r.path.split('/');
          const b = bare.split('/');
          return a.length === b.length && a.every((s, i) => s.startsWith(':') || s === b[i]);
        })?.path;
      }),
    );
    expect([...DEMO_ROUTES.map((r) => r.path)].filter((p) => !tested.has(p))).toEqual([]);
  });

  it.each(CASES)('%s answers JSON its schema accepts', (path, schema) => {
    const answer = get(path);
    expect(answer.status).toBe(200);
    expect(() => schema.parse(answer.body)).not.toThrow();
  });

  it.each(CASES)('%s answers the first-day student too (or 404s)', (path, schema) => {
    const answer = get(path, 'fresh');
    if (answer.status === 200) expect(() => schema.parse(answer.body)).not.toThrow();
    else expect(answer.body.error.code).toBe('not_found');
  });

  it('404s for unknown paths and ids', () => {
    for (const path of [
      '/v1/nope',
      '/v1/lessons/riyaziyyat-7-9-9',
      '/v1/tests/test-riyaziyyat-7-1-1',
      '/v1/classes/7a',
      '/v1/classes/join/NOPE',
      '/v1/parent/codes/ZZZZZZ',
      '/v1/parent/children/elvin/report',
      '/v1/teacher/classes/9z',
      '/v1/exam/mocks/variant-9',
      '/v1/exam/leaderboard/world',
    ])
      expect(get(path).status).toBe(404);
  });
});
