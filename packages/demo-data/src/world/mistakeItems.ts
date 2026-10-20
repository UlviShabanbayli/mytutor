/**
 * Demo mistakes by topic number: [question, the student's answer, the right answer,
 * explanation, days ago]. Our own simple maths; every right answer is checked.
 */
export const MISTAKES: Record<
  string,
  [stem: string, yours: string, right: string, explanation: string | null, daysAgo: number][]
> = {
  '4.3': [
    [
      '(x + 2)³ ifadəsini çoxhədli şəklində yaz.',
      'x³ + 12x² + 6x + 8',
      'x³ + 6x² + 12x + 8',
      'a = x, b = 2 götür: x³ + 3 · x² · 2 + 3 · x · 2² + 2³.',
      1,
    ],
    ['b³ − 8 ifadəsini vuruqlara ayır.', '(b − 2)(b² − 2b + 4)', '(b − 2)(b² + 2b + 4)', null, 1],
  ],
  '2.2': [
    [
      'a³ · a⁵ ifadəsini sadələşdir.',
      'a¹⁵',
      'a⁸',
      'Eyni əsaslı qüvvətləri vuranda üstlər toplanır: 3 + 5 = 8.',
      10,
    ],
    ['x¹⁰ : x⁴ ifadəsini sadələşdir.', 'x¹⁴', 'x⁶', 'Bölmədə üstlər çıxılır: 10 − 4 = 6.', 10],
  ],
  '3.1': [
    [
      '3a · 4a² birhədlisini standart şəklə sal.',
      '7a³',
      '12a³',
      'Əmsallar vurulur (3 · 4 = 12), üstlər toplanır (1 + 2 = 3).',
      9,
    ],
  ],
};
