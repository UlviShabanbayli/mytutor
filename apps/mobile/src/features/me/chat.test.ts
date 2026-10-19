import { makeMessage } from './chat';

describe('makeMessage', () => {
  it('trims the text and stamps the time', () => {
    const m = makeMessage(
      '  Salam!  ',
      { name: 'Nərmin', replyTo: 'Aysel M.' },
      new Date(2026, 9, 18, 9, 5),
    );
    expect(m).toMatchObject({
      text: 'Salam!',
      time: '09:05',
      mine: true,
      initials: 'N',
      replyTo: 'Aysel M.',
    });
  });
});
