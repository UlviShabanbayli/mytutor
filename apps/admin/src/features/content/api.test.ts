import { describe, expect, it } from 'vitest';
import { contentUrl } from './api';

describe('contentUrl', () => {
  it('joins and encodes path segments', () => {
    expect(contentUrl('book/topics/4.1', 'pages/p085.png')).toBe(
      '/content/book/topics/4.1/pages/p085.png',
    );
    expect(contentUrl('a b', '/c?')).toBe('/content/a%20b/c%3F');
  });
});
