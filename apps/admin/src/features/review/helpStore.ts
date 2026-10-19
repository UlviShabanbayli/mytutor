import { create } from 'zustand';

const KEY = 'mytutor-admin-review-help';

function load(): boolean {
  try {
    return localStorage.getItem(KEY) === 'hidden';
  } catch {
    return false;
  }
}

type HelpState = { hidden: boolean; hide: () => void };

/** Whether the editor closed the review's "how it works" note (kept on this browser). */
export const useReviewHelp = create<HelpState>((set) => ({
  hidden: load(),
  hide: () => {
    try {
      localStorage.setItem(KEY, 'hidden');
    } catch {
      // Private mode: the note just shows again next time.
    }
    set({ hidden: true });
  },
}));
