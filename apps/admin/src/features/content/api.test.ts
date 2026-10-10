import { afterEach, describe, expect, it, vi } from 'vitest';
import { actionUrl, contentUrl, deleteBook, restoreBook } from './api';

afterEach(() => vi.unstubAllGlobals());

const stubFetch = (body: unknown) => {
  const fetchMock = vi.fn(() => Promise.resolve(new Response(JSON.stringify(body))));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

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

describe('book actions', () => {
  // The server answers a POST to a book URL with 404, so the method is what makes delete work.
  it('deleteBook sends DELETE to the book URL', async () => {
    const fetchMock = stubFetch({ bookId: 'a b', trashId: 't1' });
    await expect(deleteBook('a b')).resolves.toEqual({ bookId: 'a b', trashId: 't1' });
    expect(fetchMock).toHaveBeenCalledWith(
      '/content-api/books/a%20b',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('restoreBook POSTs to the trash entry restore URL', async () => {
    const fetchMock = stubFetch({ bookId: 'a' });
    await expect(restoreBook('t 1')).resolves.toEqual({ bookId: 'a' });
    expect(fetchMock).toHaveBeenCalledWith(
      '/content-api/trash/t%201/restore',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
