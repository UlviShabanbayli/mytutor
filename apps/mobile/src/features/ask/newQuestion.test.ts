import { demoEventSchema } from '@mytutor/schemas';
import { newQuestion, shareablePhoto } from './newQuestion';

const base = {
  studentId: 'nermin',
  subjectId: 'math' as const,
  grade: 7,
  note: '  3-cü addımda ilişdim ',
  teacher: { classId: '7b', teacherId: 'lale' },
  photoUri: 'file:///photo.jpg',
  subjectName: 'Riyaziyyat',
  title: 'Şəkil-sual · Riyaziyyat',
  now: new Date('2026-10-20T06:00:00.000Z'),
};

describe('newQuestion', () => {
  it('is a valid ask.sent event for the class teacher', () => {
    const question = newQuestion(base);
    expect(question).toMatchObject({
      subjectId: 'riyaziyyat-7',
      queue: 'teacher',
      teacherId: 'lale',
      classId: '7b',
      note: '3-cü addımda ilişdim',
      status: 'sent',
    });
    expect(() =>
      demoEventSchema.parse({ type: 'ask.sent', id: 'e1', at: base.now.toISOString(), question }),
    ).not.toThrow();
  });

  it('goes to the general queue without a class teacher', () => {
    expect(newQuestion({ ...base, teacher: null, subjectId: 'physics' })).toMatchObject({
      subjectId: 'fizika-7',
      queue: 'general',
      teacherId: null,
      classId: null,
    });
  });

  it('keeps an inline photo on the device', () => {
    expect(shareablePhoto('data:image/jpeg;base64,AAAA')).toBeNull();
    expect(shareablePhoto('file:///photo.jpg')).toBe('file:///photo.jpg');
    expect(newQuestion({ ...base, photoUri: 'data:image/png;base64,AAAA' }).photoUri).toBeNull();
  });
});
