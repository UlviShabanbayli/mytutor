import type { Href } from 'expo-router';
import type { Role } from '@mytutor/types';

/** Where each role's interface starts (its first tab). */
export const ROLE_HOME = {
  student: '/today',
  teacher: '/teacher/classes',
  parent: '/parent/kids',
} as const satisfies Record<Role, Href>;
