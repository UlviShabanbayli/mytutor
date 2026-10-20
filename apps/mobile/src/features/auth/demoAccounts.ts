import { DEMO_ACCOUNTS } from '@mytutor/demo-data';
import type { DemoAccount } from '@mytutor/types';
import type { AgeGroup } from './types';

/**
 * The demo's existing accounts: one fake phone per role (`DEMO_ACCOUNTS`). Signing in with one
 * opens that person's role and demo world; every other number starts a new account. Better
 * Auth's session replaces this lookup.
 */
export const demoAccountFor = (e164: string): DemoAccount | null =>
  DEMO_ACCOUNTS.find((a) => a.phone === e164) ?? null;

/** Only the age group is kept: the demo's students are 13 or older, everyone else adult. */
export const ageGroupOfAccount = (account: DemoAccount): AgeGroup =>
  account.role === 'student' ? 'teen' : 'adult';
