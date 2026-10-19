import * as Linking from 'expo-linking';
import { Platform, Share } from 'react-native';

/** The deep link a student opens to join: "Mən → Sinfə qoşul" with the code filled in. */
export function inviteLink(code: string): string {
  return Linking.createURL('/me/join', { queryParams: { code } });
}

/**
 * Copies on the web; on phones it opens the system share sheet, which has "Copy" (the app has
 * no clipboard module yet). Resolves true when the text was copied directly.
 */
export async function copyText(text: string): Promise<boolean> {
  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
  await shareText(text);
  return false;
}

/** The system share sheet with the message (desktop browsers without one: copied instead). */
export async function shareText(message: string): Promise<void> {
  try {
    await Share.share({ message });
  } catch {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(message).catch(() => undefined);
    }
  }
}
