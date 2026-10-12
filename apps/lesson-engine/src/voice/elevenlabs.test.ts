import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cachedSpeech, elevenLabs } from './elevenlabs';

const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });

describe('elevenLabs', () => {
  it('asks for speech with timestamps and takes its length from the last character', async () => {
    const fetch = vi.fn(async () =>
      ok({
        audio_base64: Buffer.from('mp3').toString('base64'),
        alignment: {
          characters: ['S', 'a', 'l'],
          character_start_times_seconds: [0, 0.4, 0.9],
          character_end_times_seconds: [0.4, 0.9, 1.6],
        },
      }),
    );
    const speak = elevenLabs({ apiKey: 'key', voiceId: 'voice 1', language: 'az', fetch });
    const speech = await speak('Sal');

    expect(speech).toEqual({ audio: Buffer.from('mp3'), seconds: 1.6 });
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(
      'https://api.elevenlabs.io/v1/text-to-speech/voice%201/with-timestamps?output_format=mp3_44100_128',
    );
    expect(init.headers).toMatchObject({ 'xi-api-key': 'key' });
    expect(JSON.parse(String(init.body))).toEqual({
      text: 'Sal',
      model_id: 'eleven_v3',
      language_code: 'az',
    });
  });

  it('reports what ElevenLabs answered when a request fails', async () => {
    const fetch = vi.fn(async () => new Response('quota exceeded', { status: 401 }));
    await expect(elevenLabs({ apiKey: 'key', voiceId: 'v', fetch })('Salam')).rejects.toThrow(
      'ElevenLabs 401: quota exceeded',
    );
  });

  it('refuses narration longer than one request takes', async () => {
    const fetch = vi.fn();
    await expect(
      elevenLabs({ apiKey: 'key', voiceId: 'v', fetch })('a'.repeat(5001)),
    ).rejects.toThrow(/5001 characters/);
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('cachedSpeech', () => {
  let dir = '';
  afterEach(() => rm(dir, { recursive: true, force: true }));

  it('pays for each narration once', async () => {
    dir = await mkdtemp(join(tmpdir(), 'voice-'));
    const synthesize = vi.fn(async (text: string) => ({
      audio: Buffer.from(text),
      seconds: text.length,
    }));
    const speak = cachedSpeech(synthesize, dir, 'voice|eleven_v3');
    expect(await speak('Salam')).toEqual({ audio: Buffer.from('Salam'), seconds: 5 });
    expect(await speak('Salam')).toEqual({ audio: Buffer.from('Salam'), seconds: 5 });
    await speak('Sağ ol');
    expect(synthesize).toHaveBeenCalledTimes(2);
  });
});
