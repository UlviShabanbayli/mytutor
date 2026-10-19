import { formatNational, maskPhone, nationalDigits, phoneStatus } from './phone';

describe('nationalDigits', () => {
  it.each([
    ['501234567', '501234567'],
    ['050 123 45 67', '501234567'],
    ['+994 50 123-45-67', '501234567'],
    ['994501234567', '501234567'],
    ['50 123 45 678 9', '501234567'],
    ['abc', ''],
  ])('%s -> %s', (input, expected) => {
    expect(nationalDigits(input)).toBe(expected);
  });
});

describe('formatNational', () => {
  it('groups digits as 2-3-2-2', () => {
    expect(formatNational('501234567')).toBe('50 123 45 67');
    expect(formatNational('5012')).toBe('50 12');
    expect(formatNational('')).toBe('');
  });
});

describe('phoneStatus', () => {
  it('is empty without digits', () => {
    expect(phoneStatus('')).toEqual({ kind: 'empty' });
  });

  it('counts the missing digits', () => {
    expect(phoneStatus('50123456')).toEqual({ kind: 'incomplete', missing: 1 });
    expect(phoneStatus('50')).toEqual({ kind: 'incomplete', missing: 7 });
  });

  it('accepts Azerbaijani mobile prefixes only', () => {
    expect(phoneStatus('501234567')).toEqual({ kind: 'valid', e164: '+994501234567' });
    expect(phoneStatus('121234567')).toEqual({ kind: 'invalid' });
  });
});

describe('maskPhone', () => {
  it('keeps the operator prefix and the last two digits', () => {
    expect(maskPhone('+994501234567')).toBe('50 *** ** 67');
  });
});
