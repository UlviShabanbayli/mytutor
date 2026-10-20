import {
  classSummarySchema,
  notificationSchema,
  studentAssignmentSchema,
  todayResponseSchema,
} from '@mytutor/schemas';
import type { DemoPersona, TodayResponse } from '@mytutor/types';
import { apiGet } from '@/lib/api';
import { inboxItems } from './inbox';
import type { InboxItem } from './types';

/** The "Bu gün" area's reads from the demo world. */

export const fetchToday = (persona: DemoPersona): Promise<TodayResponse> =>
  apiGet('/v1/today', { persona, parse: todayResponseSchema.parse });

/** The student's notifications, with the assignments and teachers they name. */
export async function fetchInbox(persona: DemoPersona): Promise<InboxItem[]> {
  const [notifications, assignments, classes] = await Promise.all([
    apiGet('/v1/notifications', { persona, parse: notificationSchema.array().parse }),
    apiGet('/v1/assignments', { persona, parse: studentAssignmentSchema.array().parse }),
    apiGet('/v1/classes', { persona, parse: classSummarySchema.array().parse }),
  ]);
  return inboxItems(notifications, assignments, classes);
}
