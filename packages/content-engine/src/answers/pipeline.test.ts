import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { readAnswers } from './pipeline';

const part = (label: string | null, text: string) => ({ label, text, latex: null });
const answer = (exercise: string, text: string) => ({
  page: 12,
  exercise,
  section: null,
  parts: [part(null, text)],
});

/** A client answering each call in turn, as the API would. */
function fakeClient(outputs: unknown[]) {
  const stream = vi.fn(() => ({
    finalMessage: async () => ({
      stop_reason: 'end_turn',
      model: 'claude-opus-5-5',
      content: [{ type: 'text', text: JSON.stringify(outputs.shift()) }],
      usage: {
        input_tokens: 1000,
        output_tokens: 1000,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 0,
      },
    }),
  }));
  return { client: { beta: { messages: { stream } } } as never, stream };
}

async function answerPage() {
  const dir = await mkdtemp(join(tmpdir(), 'mytutor-answers-'));
  await mkdir(join(dir, 'pages'));
  // A PNG header is all the estimate and the request need.
  const png = Buffer.alloc(32);
  png.writeUInt32BE(100, 16);
  png.writeUInt32BE(100, 20);
  await writeFile(join(dir, 'pages', 'page-141.png'), png);
  await writeFile(
    join(dir, 'source.json'),
    JSON.stringify({
      schemaVersion: 1,
      book: { file: 'b.pdf', sha256: 'x' },
      pages: [{ page: 141, printedPage: 139, image: 'pages/page-141.png', lines: [] }],
    }),
  );
  return dir;
}

describe('readAnswers', () => {
  it('keeps what the check agrees with, flags what it reads differently or adds', async () => {
    const dir = await answerPage();
    const { client, stream } = fakeClient([
      { answers: [answer('17', '2 1/3 m'), answer('18', '−5/7'), answer('20', 'yoxdur')] },
      {
        verdicts: [
          { index: 1, verdict: 'match', correction: null },
          { index: 2, verdict: 'mismatch', correction: [part('b', '−5/7')] },
          { index: 3, verdict: 'not_found', correction: null },
        ],
        missing: [answer('19', 'tırtıl')],
      },
    ]);
    const doc = await readAnswers(dir, client, join(dir, 'cache'), () => new Date(0));
    expect(stream).toHaveBeenCalledTimes(2);
    expect(doc.answers.map((a) => [a.id, a.exercise, a.status])).toEqual([
      ['a001', '17', 'verified'],
      ['a002', '18', 'mismatch'],
      ['a003', '19', 'unverified'],
    ]);
    expect(doc.answers[1]?.correction).toEqual([part('b', '−5/7')]);
    expect(doc.answers[0]).toMatchObject({ sourcePage: 141, sourcePrintedPage: 139 });
    expect(doc.summary).toMatchObject({ answers: 3, verified: 1, mismatch: 1 });
  });
});
