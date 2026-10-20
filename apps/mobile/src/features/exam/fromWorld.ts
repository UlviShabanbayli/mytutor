import type {
  Deadline as DeadlineData,
  MockExam,
  MockListItem as MockListItemData,
} from '@mytutor/types';
import type { Deadline, MockListItem, ScheduledMock } from './types';

/** The world's exam shapes as the screens use them: ISO dates become `Date`s. */

export function toDeadline(d: DeadlineData): Deadline {
  if (d.date === null) return d;
  return { ...d, date: new Date(d.date) } as Deadline;
}

export function toMockListItem(item: MockListItemData): MockListItem {
  if (item.preparing) return item;
  return { ...item, lastDate: item.lastDate === null ? null : new Date(item.lastDate) };
}

/** The general mock's card; a mock without its dates is a bug in the world. */
export function toScheduledMock(mock: MockExam): ScheduledMock {
  if (mock.startsAt === null || mock.registrationEndsAt === null)
    throw new Error(`Mock ${mock.id} is not scheduled`);
  return {
    id: mock.id,
    subject: mock.subject,
    number: mock.number,
    startsAt: new Date(mock.startsAt),
    registrationEndsAt: new Date(mock.registrationEndsAt),
  };
}
