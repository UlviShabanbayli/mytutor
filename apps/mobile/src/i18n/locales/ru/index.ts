import { ask } from './ask';
import { core } from './core';
import { exam } from './exam';
import { learn } from './learn';
import { me } from './me';
import { onboarding } from './onboarding';
import { parent } from './parent';
import { study } from './study';
import { teacher } from './teacher';
import { today } from './today';

/**
 * Russian: the same namespaces as Azerbaijani.
 */
export const ru = { ...core, onboarding, today, learn, study, exam, ask, me, teacher, parent };
