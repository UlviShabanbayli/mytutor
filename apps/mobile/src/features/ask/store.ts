import { onlineManager } from '@tanstack/react-query';
import { create } from 'zustand';
import { DEMO_CLASS_SUBJECT_ID, type DemoSubjectId } from './demo';
import type { AskQuestion, AskQueue, CropRect, PhotoDraft, Rotation } from './types';

export type Feedback = 'yes' | 'no';

type AskState = {
  /** The photo being prepared: camera or gallery → crop → send. */
  draft: PhotoDraft | null;
  subjectId: DemoSubjectId;
  /** Null: the profile's grade. */
  grade: number | null;
  note: string;
  queue: AskQueue;
  /** Questions sent from this device (demo: kept in memory until the ask API exists). */
  sent: AskQuestion[];
  cancelledIds: string[];
  feedback: Record<string, Feedback>;
  reportedIds: string[];
  setPhoto: (photo: { uri: string; width: number; height: number }) => void;
  rotate: () => void;
  setCrop: (crop: CropRect | null) => void;
  setSubject: (subjectId: DemoSubjectId) => void;
  setGrade: (grade: number) => void;
  setNote: (note: string) => void;
  setQueue: (queue: AskQueue) => void;
  /** Files the draft as a question and clears it for the next photo. */
  addSent: (question: AskQuestion) => void;
  cancel: (id: string) => void;
  /** Queued questions go out once the device is online again. */
  flushQueued: () => void;
  setFeedback: (id: string, feedback: Feedback) => void;
  report: (id: string) => void;
};

const nextRotation = (r: Rotation): Rotation => ((r + 90) % 360) as Rotation;

export const useAskStore = create<AskState>()((set) => ({
  draft: null,
  subjectId: DEMO_CLASS_SUBJECT_ID,
  grade: null,
  note: '',
  queue: 'teacher',
  sent: [],
  cancelledIds: [],
  feedback: {},
  reportedIds: [],
  setPhoto: (photo) => set({ draft: { ...photo, rotation: 0, crop: null } }),
  rotate: () =>
    set((s) => (s.draft ? { draft: { ...s.draft, rotation: nextRotation(s.draft.rotation) } } : s)),
  setCrop: (crop) => set((s) => (s.draft ? { draft: { ...s.draft, crop } } : s)),
  setSubject: (subjectId) =>
    // Only the class subject has an own teacher; the rest go to the general queue.
    set({ subjectId, queue: subjectId === DEMO_CLASS_SUBJECT_ID ? 'teacher' : 'general' }),
  setGrade: (grade) => set({ grade }),
  setNote: (note) => set({ note }),
  setQueue: (queue) => set({ queue }),
  addSent: (question) => set((s) => ({ sent: [question, ...s.sent], draft: null, note: '' })),
  cancel: (id) =>
    set((s) => ({
      cancelledIds: [...s.cancelledIds, id],
      sent: s.sent.filter((q) => q.id !== id),
    })),
  flushQueued: () =>
    set((s) =>
      s.sent.some((q) => q.status === 'queued')
        ? {
            sent: s.sent.map((q) =>
              q.status === 'queued'
                ? { ...q, status: 'sent', sentAt: new Date().toISOString() }
                : q,
            ),
          }
        : s,
    ),
  setFeedback: (id, feedback) => set((s) => ({ feedback: { ...s.feedback, [id]: feedback } })),
  report: (id) => set((s) => ({ reportedIds: [...s.reportedIds, id] })),
}));

// A queued question leaves as soon as the connection is back (the real app uploads it then).
onlineManager.subscribe((online) => {
  if (online) useAskStore.getState().flushQueued();
});
