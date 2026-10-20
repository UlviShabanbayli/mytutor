/** Copying works where it needs no native module (the web); phones need expo-clipboard. */
export const canCopy = typeof navigator !== 'undefined' && navigator.clipboard !== undefined;

export async function copyText(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}
