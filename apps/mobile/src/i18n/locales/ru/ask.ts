import type { Messages } from '../../types';
import type { ask as az } from '../az/ask';

// Russian strings of the "ask" area; same keys as the Azerbaijani file.
export const ask = {} satisfies Messages<typeof az>;
