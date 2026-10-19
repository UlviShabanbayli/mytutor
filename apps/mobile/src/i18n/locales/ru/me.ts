import type { Messages } from '../../types';
import type { me as az } from '../az/me';

// Russian strings of the "me" area; same keys as the Azerbaijani file.
export const me = {} satisfies Messages<typeof az>;
