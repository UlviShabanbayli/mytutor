import { upperCase } from './letterCase';

describe('upperCase', () => {
  it('keeps the dot on the Azerbaijani capital İ', () => {
    expect(upperCase('Sənin sinfin üçün', 'az')).toBe('SƏNİN SİNFİN ÜÇÜN');
    expect(upperCase('Şagirdəm', 'az')).toBe('ŞAGİRDƏM');
  });

  it('turns the dotless ı into I', () => {
    expect(upperCase('Bal qazandın', 'az')).toBe('BAL QAZANDIN');
  });

  it('uses the plain rules for Russian', () => {
    expect(upperCase('Продолжить', 'ru')).toBe('ПРОДОЛЖИТЬ');
  });
});
