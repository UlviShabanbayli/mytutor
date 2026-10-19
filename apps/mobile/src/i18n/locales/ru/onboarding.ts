import type { Messages } from '../../types';
import type { onboarding as az } from '../az/onboarding';

// Russian strings of the "onboarding" area; same keys as the Azerbaijani file.
export const onboarding = {
  roleTitle: 'Давай знакомиться! Кто ты?',
  role: {
    student: 'Я ученик',
    teacher: 'Я учитель или репетитор',
    parent: 'Я родитель',
  },
} satisfies Messages<typeof az>;
