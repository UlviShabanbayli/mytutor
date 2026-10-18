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
 * Azerbaijani: shared keys plus one namespace per app area (the architecture's feature areas).
 * Each area edits only its own file, so parallel work never collides here.
 */
export const az = { ...core, onboarding, today, learn, study, exam, ask, me, teacher, parent };
