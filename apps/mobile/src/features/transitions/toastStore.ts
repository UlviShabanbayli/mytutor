import { create } from 'zustand';

export type Toast = { id: number; message: string };

type ToastState = {
  toast: Toast | null;
  show: (message: string) => void;
  /** Called by the toast once it has gone; a newer toast is kept. */
  clear: (id: number) => void;
};

let nextId = 1;

/** One short confirmation at a time ("Yadda saxlandı"); a new one replaces the old. */
export const useToastStore = create<ToastState>()((set) => ({
  toast: null,
  show: (message) => set({ toast: { id: nextId++, message } }),
  clear: (id) => set((s) => (s.toast?.id === id ? { toast: null } : s)),
}));

/** Shows a small toast at the bottom of the screen, e.g. after a setting was saved. */
export function showToast(message: string): void {
  useToastStore.getState().show(message);
}
