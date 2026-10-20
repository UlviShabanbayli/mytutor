import { Platform, Share } from 'react-native';

/** `copied`: on the clipboard; `shared`: the share sheet opened (it has "Copy"); `failed`. */
export type CopyResult = 'copied' | 'shared' | 'failed';

/** True where text can be put on the clipboard directly (the web; phones need expo-clipboard). */
export function canCopyDirectly(): boolean {
  return (
    Platform.OS === 'web' &&
    typeof navigator !== 'undefined' &&
    typeof navigator.clipboard?.writeText === 'function'
  );
}

/**
 * Copies on the web. On phones the app has no clipboard module yet (expo-clipboard is not
 * installed), so it opens the system share sheet instead, as the copy buttons did before.
 */
export async function copyOrShare(text: string): Promise<CopyResult> {
  if (canCopyDirectly()) {
    try {
      await navigator.clipboard.writeText(text);
      return 'copied';
    } catch {
      return 'failed';
    }
  }
  try {
    await Share.share({ message: text });
    return 'shared';
  } catch {
    return 'failed';
  }
}
