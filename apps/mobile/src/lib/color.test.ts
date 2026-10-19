import { withAlpha } from './color';

describe('withAlpha', () => {
  it('turns a hex colour into rgba', () => {
    expect(withAlpha('#FFB800', 0.45)).toBe('rgba(255,184,0,0.45)');
  });

  it('leaves other colours alone', () => {
    expect(withAlpha('rgba(0,0,0,0.6)', 0.2)).toBe('rgba(0,0,0,0.6)');
  });
});
