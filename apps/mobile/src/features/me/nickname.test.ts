import { isValidNickname } from './nickname';

describe('isValidNickname', () => {
  it('accepts letters (Azerbaijani too), digits and underscores', () => {
    expect(isValidNickname('BalArısı_27')).toBe(true);
    expect(isValidNickname('Çiçəkçi_5')).toBe(true);
  });

  it('rejects short, long and spaced names', () => {
    expect(isValidNickname('ab')).toBe(false);
    expect(isValidNickname('a'.repeat(21))).toBe(false);
    expect(isValidNickname('Bal Arısı')).toBe(false);
  });
});
