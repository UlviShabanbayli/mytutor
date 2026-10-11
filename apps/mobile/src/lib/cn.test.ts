import { cn } from './cn';

describe('cn', () => {
  it('lets later classes override earlier ones', () => {
    expect(cn('rounded-lg bg-card p-4', 'bg-accent-muted p-2')).toBe(
      'rounded-lg bg-accent-muted p-2',
    );
  });

  it('keeps font family, size and color utilities side by side', () => {
    expect(cn('font-sans-bold text-base', 'text-primary-foreground')).toBe(
      'font-sans-bold text-base text-primary-foreground',
    );
  });

  it('skips falsy values', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b');
  });
});
