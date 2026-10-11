import i18n from './index';
import { formatDateTime } from './formatDateTime';

describe('formatDateTime', () => {
  it('formats with Azerbaijani month names', () => {
    expect(formatDateTime(i18n.t, new Date(2026, 9, 8, 0, 31))).toBe('8 oktyabr, 00:31');
  });
});
