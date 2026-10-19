import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type NotificationKind = 'reminders' | 'classes' | 'answers' | 'league';
export const NOTIFICATION_KINDS: readonly NotificationKind[] = [
  'reminders',
  'classes',
  'answers',
  'league',
];

/** Quiet hours as "from–to" (design "22:00–08:00"); no notifications inside them. */
export const QUIET_HOURS = ['21:00–07:00', '22:00–08:00', '23:00–09:00'] as const;
export type QuietHours = (typeof QUIET_HOURS)[number] | 'off';

type FeelKey = 'sound' | 'haptics' | 'reduceMotion';

type SettingsState = {
  sound: boolean;
  haptics: boolean;
  reduceMotion: boolean;
  notifications: Record<NotificationKind, boolean>;
  quietHours: QuietHours;
  setFeel: (key: FeelKey, on: boolean) => void;
  setNotification: (kind: NotificationKind, on: boolean) => void;
  setQuietHours: (value: QuietHours) => void;
};

/**
 * The student's device preferences from "Ayarlar" (sound, motion, notifications). Kept on the
 * device; `playCue` and notifications read them once those features exist (architecture P1).
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      sound: true,
      haptics: true,
      reduceMotion: false,
      notifications: { reminders: true, classes: true, answers: true, league: false },
      quietHours: '22:00–08:00',
      setFeel: (key, on) => set({ [key]: on }),
      setNotification: (kind, on) =>
        set((s) => ({ notifications: { ...s.notifications, [kind]: on } })),
      setQuietHours: (quietHours) => set({ quietHours }),
    }),
    {
      name: 'ari-me-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ sound, haptics, reduceMotion, notifications, quietHours }) => ({
        sound,
        haptics,
        reduceMotion,
        notifications,
        quietHours,
      }),
    },
  ),
);
