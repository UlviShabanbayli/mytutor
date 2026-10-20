import type { DemoAccount } from '@mytutor/types';
import { FRESH, LALE, NERMIN, SEBINE } from './ids';

/**
 * The demo's sign-in: one obviously fake phone per role, and one SMS code for all of them.
 * Demo mode only; real accounts (Better Auth + Twilio Verify) replace them.
 */

/** The code every demo phone "receives". */
export const DEMO_SMS_CODE = '246810';

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    phone: '+994500000001',
    role: 'student',
    persona: 'nermin',
    personId: NERMIN,
    label: 'Nərmin Əliyeva · 7B',
  },
  {
    phone: '+994500000002',
    role: 'student',
    persona: 'fresh',
    personId: FRESH,
    label: 'Yeni şagird',
  },
  {
    phone: '+994500000003',
    role: 'teacher',
    persona: 'nermin',
    personId: LALE,
    label: 'Lalə Həsənova · müəllim',
  },
  {
    phone: '+994500000004',
    role: 'parent',
    persona: 'nermin',
    personId: SEBINE,
    label: 'Səbinə Əliyeva · valideyn',
  },
];

/** "+994500000004" → "+994 50 *** ** 04". */
export const maskPhone = (e164: string) => `+994 ${e164.slice(4, 6)} *** ** ${e164.slice(11, 13)}`;

export function accountOf(personId: string): DemoAccount {
  const found = DEMO_ACCOUNTS.find((a) => a.personId === personId);
  if (!found) throw new Error(`No demo account for ${personId}`);
  return found;
}
