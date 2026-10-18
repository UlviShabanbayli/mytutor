import type { ChatMessage } from './types';

const pad = (n: number) => String(n).padStart(2, '0');

/** The student's new class-chat message as the demo store keeps it (the API assigns ids later). */
export function makeMessage(
  text: string,
  author: { name: string; replyTo?: string },
  now = new Date(),
): ChatMessage {
  return {
    id: `mine-${now.getTime()}`,
    author: author.name,
    initials: author.name.charAt(0),
    role: 'student',
    mine: true,
    text: text.trim(),
    time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
    replyTo: author.replyTo,
  };
}

/** Copying works where it needs no native module (the web); phones need expo-clipboard. */
export const canCopy = typeof navigator !== 'undefined' && navigator.clipboard !== undefined;

export async function copyText(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}
