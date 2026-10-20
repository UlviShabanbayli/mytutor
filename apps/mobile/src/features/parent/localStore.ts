import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { NotificationPrefs } from '@mytutor/types';
import { registerDemoReset } from '@/lib/demoEvents';
import type { NotificationKind } from './types';

type ParentLocalState = {
  /** When the parent last opened each conversation on this device (thread id → ISO). */
  seenAt: Record<string, string>;
  /** Messages this device sent to moderation. */
  reported: string[];
  /** Notification switches changed on this device, over the server's defaults. */
  prefs: Partial<NotificationPrefs>;
  markSeen: (threadId: string, at: string) => void;
  report: (messageId: string) => void;
  setPref: (kind: NotificationKind, on: boolean) => void;
};

/**
 * The parent's own device state, which no other role sees: read marks, reports to moderation
 * and notification switches. Everything another role sees (links, consent, messages) is a demo
 * event instead (`useDemoWrite`). Only the switches outlive a reload.
 */
export const useParentLocalStore = create<ParentLocalState>()(
  persist(
    (set) => ({
      seenAt: {},
      reported: [],
      prefs: {},
      markSeen: (threadId, at) => set((s) => ({ seenAt: { ...s.seenAt, [threadId]: at } })),
      report: (messageId) =>
        set((s) => (s.reported.includes(messageId) ? s : { reported: [...s.reported, messageId] })),
      setPref: (kind, on) => set((s) => ({ prefs: { ...s.prefs, [kind]: on } })),
    }),
    {
      name: 'ari-parent-local',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ prefs }) => ({ prefs }),
    },
  ),
);

// "Demo məlumatını sıfırla": read marks, reports and switches go back to the server's.
registerDemoReset(() => useParentLocalStore.setState({ seenAt: {}, reported: [], prefs: {} }));
