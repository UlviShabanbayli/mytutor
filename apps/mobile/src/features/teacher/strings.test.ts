import i18n from '@/i18n';

const tr = (lng: 'az' | 'ru') => i18n.getFixedT(lng);

describe('teacher strings', () => {
  it('writes Azerbaijani grade ordinals and counts', () => {
    const t = tr('az');
    expect(t('common.grade', { count: 7, ordinal: true })).toBe('7-ci sinif');
    expect(t('common.grade', { count: 9, ordinal: true })).toBe('9-cu sinif');
    expect(t('teacher.students', { count: 24 })).toBe('24 şagird');
  });

  it('uses the Russian plural forms', () => {
    const t = tr('ru');
    expect(t('teacher.students', { count: 1 })).toBe('1 ученик');
    expect(t('teacher.students', { count: 3 })).toBe('3 ученика');
    expect(t('teacher.students', { count: 24 })).toBe('24 ученика');
    expect(t('teacher.students', { count: 46 })).toBe('46 учеников');
    expect(t('teacher.classes.inHours', { count: 2 })).toBe('через 2 часа');
  });
});
