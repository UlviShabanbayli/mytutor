import {
  announcementSchema,
  chatThreadDetailSchema,
  chatThreadViewSchema,
  childAssignmentListSchema,
  notificationPrefsSchema,
  notificationSchema,
  parentCodeLookupSchema,
  parentHomeSchema,
  reportPageSchema,
  subjectProgressSchema,
} from '@mytutor/schemas';
import type { DemoPersona, ReportPage } from '@mytutor/types';
import { ApiError, apiGet } from '@/lib/api';

/**
 * The parent's reads of the demo world (`/v1/parent/*`). Only what a child shares leaves the
 * server; a child who is not linked is a 404, which these turn into "nothing".
 */

async function orNull<T>(request: Promise<T>): Promise<T | null> {
  try {
    return await request;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

const child = (childId: string) => `/v1/parent/children/${encodeURIComponent(childId)}`;

export const fetchHome = (persona: DemoPersona) =>
  apiGet('/v1/parent', { persona, parse: parentHomeSchema.parse });

export const fetchNotifications = (persona: DemoPersona) =>
  apiGet('/v1/parent/notifications', { persona, parse: notificationSchema.array().parse });

export const fetchThreads = (persona: DemoPersona) =>
  apiGet('/v1/parent/messages', { persona, parse: chatThreadViewSchema.array().parse });

export const fetchThreadDetail = (persona: DemoPersona, threadId: string) =>
  orNull(
    apiGet(`/v1/parent/messages/${encodeURIComponent(threadId)}`, {
      persona,
      parse: chatThreadDetailSchema.parse,
    }),
  );

export const fetchNotes = (persona: DemoPersona) =>
  apiGet('/v1/parent/notes', { persona, parse: announcementSchema.array().parse });

export async function fetchReport(
  persona: DemoPersona,
  childId: string,
  week: number,
): Promise<ReportPage> {
  const page = await orNull(
    apiGet(`${child(childId)}/report?week=${week}`, { persona, parse: reportPageSchema.parse }),
  );
  return page ?? { report: null, hasPrevious: false, hasNext: week > 0 };
}

export async function fetchProgress(persona: DemoPersona, childId: string) {
  const subjects = await orNull(
    apiGet(`${child(childId)}/progress`, { persona, parse: subjectProgressSchema.array().parse }),
  );
  return subjects ?? [];
}

export const fetchAssignments = (persona: DemoPersona, childId: string) =>
  orNull(
    apiGet(`${child(childId)}/assignments`, { persona, parse: childAssignmentListSchema.parse }),
  );

export const fetchPrefs = (persona: DemoPersona) =>
  apiGet('/v1/parent/prefs', { persona, parse: notificationPrefsSchema.parse });

/** Whose a child's link code is; null when no such code exists. */
export const lookupCode = (persona: DemoPersona, code: string) =>
  orNull(
    apiGet(`/v1/parent/codes/${encodeURIComponent(code.trim().toUpperCase())}`, {
      persona,
      parse: parentCodeLookupSchema.parse,
    }),
  );
