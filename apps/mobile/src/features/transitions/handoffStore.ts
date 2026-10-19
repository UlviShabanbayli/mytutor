import { create } from 'zustand';

/** A box on the screen, in window coordinates. */
export type Rect = { x: number; y: number; width: number; height: number };

type HandoffState = {
  /** The small topic cell in the test header, as last laid out. */
  source: { code: string; rect: Rect } | null;
  /** A cell on its way to the result card. */
  flight: { code: string; from: Rect } | null;
  /** Where the result card's cell is. */
  target: Rect | null;
  /** The flying cell has landed: the result shows its own cell again. */
  landed: boolean;
  setSource: (code: string, rect: Rect) => void;
  setTarget: (rect: Rect) => void;
  arm: () => void;
  land: () => void;
};

/** A flight that never starts (the result could not be measured) gives up after this. */
const GIVE_UP_MS = 3000;

/**
 * transitions.handoff B: hands the topic cell from the last test question to the result. The
 * test arms it when it opens the result; the result's overlay flies it and lands it.
 */
export const useHandoffStore = create<HandoffState>()((set, get) => ({
  source: null,
  flight: null,
  target: null,
  landed: true,
  setSource: (code, rect) => set({ source: { code, rect } }),
  setTarget: (rect) => set({ target: rect }),
  arm: () => {
    const { source } = get();
    if (!source) return;
    const flight = { code: source.code, from: source.rect };
    set({ flight, target: null, landed: false });
    setTimeout(() => {
      if (get().flight === flight && get().target === null) get().land();
    }, GIVE_UP_MS);
  },
  land: () => set({ flight: null, landed: true }),
}));

/** Called by the test right before it opens its result. */
export function armHandoff(): void {
  useHandoffStore.getState().arm();
}
