import { describe, expect, it } from 'vitest';
import { otpCodeSchema, phoneNumberSchema } from './phone';

describe('phoneNumberSchema', () => {
  it.each([
    ['050 123 45 67', '+994501234567'],
    ['0551234567', '+994551234567'],
    ['994701234567', '+994701234567'],
    ['+994 99 123-45-67', '+994991234567'],
    ['101234567', '+994101234567'],
  ])('normalizes %s to %s', (input, expected) => {
    expect(phoneNumberSchema.parse(input)).toBe(expected);
  });

  it.each(['', '012 123 45 67', '+99450123456', '+15551234567', 'abc'])('rejects %s', (input) => {
    expect(phoneNumberSchema.safeParse(input).success).toBe(false);
  });
});

describe('otpCodeSchema', () => {
  it('accepts exactly six digits', () => {
    expect(otpCodeSchema.safeParse('123456').success).toBe(true);
    expect(otpCodeSchema.safeParse('12345').success).toBe(false);
    expect(otpCodeSchema.safeParse('12345a').success).toBe(false);
  });
});
