import { create } from 'zustand';

type DepthState = {
  /** A `DepthDialog` is open: the screen behind it steps back. */
  receded: boolean;
  setReceded: (receded: boolean) => void;
};

/** Links a confirmation dialog to the `DepthScreen` of the screen it opens over. */
export const useDepthStore = create<DepthState>()((set) => ({
  receded: false,
  setReceded: (receded) => set({ receded }),
}));
