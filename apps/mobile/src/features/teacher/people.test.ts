import { firstName, initials, matchesName, shortName } from './people';

describe('initials', () => {
  it('takes the first letters of two words in Azerbaijani upper case', () => {
    expect(initials('Nərmin Əliyeva')).toBe('NƏ');
    expect(initials('Tural İ.')).toBe('Tİ');
    expect(initials('ilkin təhməz')).toBe('İT');
  });

  it('uses two letters of a single name', () => {
    expect(initials('Səbinə')).toBe('SƏ');
  });
});

describe('shortName', () => {
  it('shortens the surname to its initial', () => {
    expect(shortName('Nərmin Əliyeva')).toBe('Nərmin Ə.');
  });

  it('keeps names that are already short', () => {
    expect(shortName('Orxan M.')).toBe('Orxan M.');
    expect(shortName('Səbinə')).toBe('Səbinə');
  });
});

describe('firstName', () => {
  it('returns the first word', () => {
    expect(firstName('Leyla R.')).toBe('Leyla');
  });
});

describe('matchesName', () => {
  it('matches any part of the name, ignoring case and dotted letters', () => {
    expect(matchesName('İlkin T.', 'ilk')).toBe(true);
    expect(matchesName('Tural İ.', 'TURAL')).toBe(true);
    expect(matchesName('Kamran V.', 'nər')).toBe(false);
    expect(matchesName('Kamran V.', '  ')).toBe(true);
  });
});
