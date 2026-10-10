import { describe, expect, it } from 'vitest';
import { titleFromFileName } from './bookTitle';

describe('titleFromFileName', () => {
  it('turns a file name into a starting title, keeping ordinal suffixes', () => {
    expect(titleFromFileName('riyaziyyat-7-ci-sinif_1-ci-hisse.pdf')).toBe(
      'riyaziyyat 7-ci sinif 1-ci hisse',
    );
  });
});
