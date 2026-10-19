import * as Linking from 'expo-linking';
import { Platform, Share } from 'react-native';

/** The deep link a student opens to join: "Mən → Sinfə qoşul" with the code filled in. */
export function inviteLink(code: string): string {
  return Linking.createURL('/me/join', { queryParams: { code } });
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
