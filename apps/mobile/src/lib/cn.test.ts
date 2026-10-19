import { cn } from './cn';

describe('cn', () => {
  it('lets later classes override earlier ones', () => {
    expect(cn('rounded-lg bg-surf p-4', 'bg-raised p-2')).toBe('rounded-lg bg-raised p-2');
  });

  it('keeps font family, size and color utilities side by side', () => {
    expect(cn('font-sans-bold text-base', 'text-on-honey')).toBe(
      'font-sans-bold text-base text-on-honey',
    );
  });

  it('keeps the arı type sizes apart from text colors', () => {
    expect(cn('font-sans-black text-2xs uppercase', 'text-muted')).toBe(
      'font-sans-black text-2xs uppercase text-muted',
    );
    expect(cn('font-sans-black text-md', 'text-ink')).toBe('font-sans-black text-md text-ink');
  });

  it('skips falsy values', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b');
  });
});
