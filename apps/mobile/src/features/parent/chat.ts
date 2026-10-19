import type { ChatMessage } from './types';

export type DayGroup = { key: string; date: Date; messages: ChatMessage[] };

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/** Messages in time order, split by calendar day (the thread's "BU GÜN" separators). */
export function groupByDay(messages: ChatMessage[]): DayGroup[] {
  const sorted = [...messages].sort((a, b) => a.at.localeCompare(b.at));
  const groups: DayGroup[] = [];
  for (const message of sorted) {
    const date = new Date(message.at);
    const key = dayKey(date);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.messages.push(message);
    else groups.push({ key, date, messages: [message] });
  }
  return groups;
}

/** Copying works where the platform offers a clipboard (the web); native needs expo-clipboard. */
export const canCopyText = () =>
  typeof navigator !== 'undefined' && typeof navigator.clipboard?.writeText === 'function';

export async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}
