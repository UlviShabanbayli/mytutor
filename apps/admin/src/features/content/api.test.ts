import { describe, expect, it } from 'vitest';
import { actionUrl, contentUrl } from './api';

describe('contentUrl', () => {
  it('joins and encodes path segments', () => {
    expect(contentUrl('book/topics/4.1', 'pages/p085.png')).toBe(
      '/content/book/topics/4.1/pages/p085.png',
    );
    expect(contentUrl('a b', '/c?')).toBe('/content/a%20b/c%3F');
  });
});

describe('actionUrl', () => {
  it('builds action URLs outside /content/ so book folders cannot shadow them', () => {
    expect(actionUrl('books', 'a b', 'topics', '1.1', 'source')).toBe(
      '/content-api/books/a%20b/topics/1.1/source',
    );
  });
});
