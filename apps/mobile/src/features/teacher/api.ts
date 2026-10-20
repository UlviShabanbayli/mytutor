import {
  askQuestionViewSchema,
  bankQuestionSchema,
  chatThreadDetailSchema,
  chatThreadViewSchema,
  classFeedSchema,
  classInsightsSchema,
  curriculumResponseSchema,
  liveLessonSchema,
  materialSchema,
  notificationSchema,
  submissionViewSchema,
  teacherAssignmentSchema,
  teacherClassDetailSchema,
  teacherHomeSchema,
} from '@mytutor/schemas';
import type { DemoPersona } from '@mytutor/types';
import { ApiError, apiGet } from '@/lib/api';

/*
 * The teacher area's reads of the demo world: GET /v1/teacher/* (and the curriculum), each
 * answer checked with its schema. `apiGet` asks the API and falls back to the same world on
 * the device; either way the current persona's demo events are applied.
 */

const enc = encodeURIComponent;

export const getCurriculum = (persona: DemoPersona) =>
  apiGet('/v1/curriculum', { persona, parse: curriculumResponseSchema.parse });

export const getHome = (persona: DemoPersona) =>
  apiGet('/v1/teacher', { persona, parse: teacherHomeSchema.parse });

export const getClass = (persona: DemoPersona, id: string) =>
  apiGet(`/v1/teacher/classes/${enc(id)}`, { persona, parse: teacherClassDetailSchema.parse });

export const getAssignments = (persona: DemoPersona) =>
  apiGet('/v1/teacher/assignments', { persona, parse: teacherAssignmentSchema.array().parse });

export const getSubmissions = (persona: DemoPersona, assignmentId: string) =>
  apiGet(`/v1/teacher/assignments/${enc(assignmentId)}/submissions`, {
    persona,
    parse: submissionViewSchema.array().parse,
  });

export const getInbox = (persona: DemoPersona) =>
  apiGet('/v1/teacher/inbox', { persona, parse: askQuestionViewSchema.array().parse });

export const getQuestion = (persona: DemoPersona, id: string) =>
  apiGet(`/v1/teacher/inbox/${enc(id)}`, { persona, parse: askQuestionViewSchema.parse });

export const getMaterials = (persona: DemoPersona) =>
  apiGet('/v1/teacher/materials', { persona, parse: materialSchema.array().parse });

export const getBank = (persona: DemoPersona) =>
  apiGet('/v1/teacher/bank', { persona, parse: bankQuestionSchema.array().parse });

export const getInsights = (persona: DemoPersona, classId: string) =>
  apiGet(`/v1/teacher/insights/${enc(classId)}`, { persona, parse: classInsightsSchema.parse });

export const getLive = (persona: DemoPersona) =>
  apiGet('/v1/teacher/live', { persona, parse: liveLessonSchema.array().parse });

export const getThreads = (persona: DemoPersona) =>
  apiGet('/v1/teacher/messages', { persona, parse: chatThreadViewSchema.array().parse });

export const getThread = (persona: DemoPersona, id: string) =>
  apiGet(`/v1/teacher/messages/${enc(id)}`, { persona, parse: chatThreadDetailSchema.parse });

export const getNotifications = (persona: DemoPersona) =>
  apiGet('/v1/teacher/notifications', { persona, parse: notificationSchema.array().parse });

/**
 * A class's announcements. The teacher routes do not return them yet, so they are read from the
 * class feed, which answers only for the persona student's own class; elsewhere the list is
 * empty (proposal: add `announcements` to GET /v1/teacher/classes/:id).
 */
export async function getAnnouncements(persona: DemoPersona, classId: string) {
  try {
    const feed = await apiGet(`/v1/classes/${enc(classId)}`, {
      persona,
      parse: classFeedSchema.parse,
    });
    return feed.announcements;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return [];
    throw error;
  }
}
