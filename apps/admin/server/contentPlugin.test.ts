import type { IncomingMessage } from 'node:http';
import { describe, expect, it } from 'vitest';
import { isSameOrigin } from './contentPlugin';

const req = (headers: Record<string, string>) => ({ headers }) as unknown as IncomingMessage;

describe('isSameOrigin', () => {
  it('allows the panel itself and tools without an Origin (curl)', () => {
    expect(isSameOrigin(req({ host: 'localhost:5180', origin: 'http://localhost:5180' }))).toBe(
      true,
    );
    expect(isSameOrigin(req({ host: 'localhost:5180' }))).toBe(true);
  });

  it('refuses other sites', () => {
    expect(isSameOrigin(req({ host: 'localhost:5180', origin: 'https://evil.example' }))).toBe(
      false,
    );
    expect(isSameOrigin(req({ host: 'localhost:5180', 'sec-fetch-site': 'cross-site' }))).toBe(
      false,
    );
    expect(isSameOrigin(req({ host: 'localhost:5180', origin: 'null' }))).toBe(false);
  });
});
