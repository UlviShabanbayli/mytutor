import { genitiveAz, joinList } from './text';

describe('genitiveAz', () => {
  it('follows the last vowel and adds n after a vowel', () => {
    expect(genitiveAz('Nərmin')).toBe('Nərminin');
    expect(genitiveAz('Elvin')).toBe('Elvinin');
    expect(genitiveAz('Lalə')).toBe('Lalənin');
    expect(genitiveAz('Murad')).toBe('Muradın');
    expect(genitiveAz('Aysu')).toBe('Aysunun');
    expect(genitiveAz('Gül')).toBe('Gülün');
    expect(genitiveAz('Orxan')).toBe('Orxanın');
  });
});

describe('joinList', () => {
  it('uses the last separator before the last item only', () => {
    expect(joinList(['a'], ', ', ' və ')).toBe('a');
    expect(joinList(['a', 'b'], ', ', ' və ')).toBe('a və b');
    expect(joinList(['a', 'b', 'c'], ', ', ' və ')).toBe('a, b və c');
  });
});
