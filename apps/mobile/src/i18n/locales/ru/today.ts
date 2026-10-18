import type { Messages } from '../../types';
import type { today as az } from '../az/today';

// Russian strings of the "today" area; same keys as the Azerbaijani file.
export const today = {} satisfies Messages<typeof az>;
