import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AgeGroup, AuthReason, CodeTarget, DeviceAccount } from './types';

type AuthState = {
  /** The flow in progress (memory only). */
  reason: AuthReason;
  /** E.164 numbers of the flow; kept in memory only, never written to the device. */
  phone: Record<CodeTarget, string | null>;
  /** When a new code may be requested, per number (timestamps). */
  resendAt: Record<CodeTarget, number | null>;
  /** The account on this device; null for a guest. Persisted. */
  account: DeviceAccount | null;
  startFlow: (reason: AuthReason) => void;
  setPhone: (target: CodeTarget, phone: string | null) => void;
  setResendAt: (target: CodeTarget, at: number | null) => void;
  createAccount: (ageGroup: AgeGroup, consent: DeviceAccount['consent']) => void;
  signOut: () => void;
};

const NONE = { self: null, parent: null };

/**
 * The account flow and the device's account (architecture Ş1). With the auth API the session
 * token moves to SecureStore (Better Auth Expo client); only `account` is stored here for now.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      reason: 'save_progress',
      phone: NONE,
      resendAt: NONE,
      account: null,
      startFlow: (reason) => set({ reason, phone: NONE, resendAt: NONE }),
      setPhone: (target, phone) => set((s) => ({ phone: { ...s.phone, [target]: phone } })),
      setResendAt: (target, at) => set((s) => ({ resendAt: { ...s.resendAt, [target]: at } })),
      createAccount: (ageGroup, consent) =>
        set({
          account: { ageGroup, consent, createdAt: new Date().toISOString() },
          // The flow is over: forget the numbers.
          phone: NONE,
          resendAt: NONE,
        }),
      signOut: () => set({ account: null }),
    }),
    {
      name: 'ari-auth',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ account }) => ({ account }),
    },
  ),
);

/** True when this device has an account (the "account needed" moment is not needed then). */
export function useHasAccount(): boolean {
  return useAuthStore((s) => s.account !== null);
}
