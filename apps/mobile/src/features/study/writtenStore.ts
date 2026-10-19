import { create } from 'zustand';

// Photos of a written solution. Demo until the attempts API takes uploads (architecture Ş5,
// M4): a photo is a placeholder page, "sent" when the device is online and "failed" (with a
// retry) when it is not. Picking a real photo needs a camera or image-picker library.

export type WrittenPhoto = { id: string; status: 'sent' | 'failed' };

type WrittenState = {
  photos: Record<string, WrittenPhoto[]>;
  add: (stepId: string, online: boolean) => void;
  retry: (stepId: string, photoId: string, online: boolean) => void;
  remove: (stepId: string, photoId: string) => void;
};

export const MAX_PHOTOS = 4;

let nextId = 1;

export const useWrittenStore = create<WrittenState>((set) => ({
  photos: {},
  add: (stepId, online) =>
    set((s) => {
      const list = s.photos[stepId] ?? [];
      if (list.length >= MAX_PHOTOS) return {};
      const photo: WrittenPhoto = { id: `p${nextId++}`, status: online ? 'sent' : 'failed' };
      return { photos: { ...s.photos, [stepId]: [...list, photo] } };
    }),
  retry: (stepId, photoId, online) =>
    set((s) => ({
      photos: {
        ...s.photos,
        [stepId]: (s.photos[stepId] ?? []).map((p) =>
          p.id === photoId ? { ...p, status: online ? 'sent' : 'failed' } : p,
        ),
      },
    })),
  remove: (stepId, photoId) =>
    set((s) => ({
      photos: { ...s.photos, [stepId]: (s.photos[stepId] ?? []).filter((p) => p.id !== photoId) },
    })),
}));
