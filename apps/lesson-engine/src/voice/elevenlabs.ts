import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

/** Narration audio (MP3) and how long it plays. */
export type Speech = { audio: Buffer; seconds: number };
export type Synthesize = (text: string) => Promise<Speech>;

/** ElevenLabs takes at most this many characters per request (Eleven v3). */
const MAX_CHARACTERS = 5000;

type ElevenLabsOptions = {
  apiKey: string;
  voiceId: string;
  /** eleven_v3 and later speak Azerbaijani; eleven_multilingual_v2 does not. */
  model?: string;
  /** ISO 639-1 language code, sent only when set (not every model takes it). */
  language?: string;
  fetch?: typeof fetch;
};

type Alignment = { character_end_times_seconds?: unknown } | null | undefined;

const endOf = (alignment: Alignment): number => {
  const ends = alignment?.character_end_times_seconds;
  return Array.isArray(ends) ? Math.max(0, ...ends.filter((t) => typeof t === 'number')) : 0;
};

/**
 * Text to speech with ElevenLabs. The "with timestamps" endpoint returns when each character
 * ends, so the narration's length is known exactly and each lesson step lasts as long as its
 * voice.
 */
export function elevenLabs({
  apiKey,
  voiceId,
  model = 'eleven_v3',
  language,
  fetch: request = fetch,
}: ElevenLabsOptions): Synthesize {
  return async (text) => {
    if (text.length > MAX_CHARACTERS)
      throw new Error(`Narration is ${text.length} characters; ElevenLabs takes ${MAX_CHARACTERS}`);
    const url =
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}` +
      '/with-timestamps?output_format=mp3_44100_128';
    const res = await request(url, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'content-type': 'application/json' },
      body: JSON.stringify({
        text,
        model_id: model,
        ...(language ? { language_code: language } : {}),
      }),
    });
    if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const body = (await res.json()) as {
      audio_base64?: unknown;
      alignment?: Alignment;
      normalized_alignment?: Alignment;
    };
    if (typeof body.audio_base64 !== 'string') throw new Error('ElevenLabs returned no audio');
    const seconds = endOf(body.alignment) || endOf(body.normalized_alignment);
    if (!seconds) throw new Error('ElevenLabs returned no timing for the audio');
    return { audio: Buffer.from(body.audio_base64, 'base64'), seconds };
  };
}

/**
 * Keeps speech on disk by voice, model and text: rendering a lesson again, or a lesson whose
 * other steps changed, pays only for narration it has not heard yet.
 */
export function cachedSpeech(synthesize: Synthesize, dir: string, voiceKey: string): Synthesize {
  return async (text) => {
    const id = createHash('sha256').update(`${voiceKey}\n${text}`).digest('hex').slice(0, 24);
    const audioFile = join(dir, `${id}.mp3`);
    const metaFile = join(dir, `${id}.json`);
    try {
      const { seconds } = JSON.parse(await readFile(metaFile, 'utf8')) as { seconds: number };
      return { audio: await readFile(audioFile), seconds };
    } catch {
      const speech = await synthesize(text);
      await mkdir(dir, { recursive: true });
      await writeFile(audioFile, speech.audio);
      await writeFile(metaFile, JSON.stringify({ seconds: speech.seconds }));
      return speech;
    }
  };
}
