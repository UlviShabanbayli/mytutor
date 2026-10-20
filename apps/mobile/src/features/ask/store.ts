import { create } from 'zustand';
import type { AskQuestion as WorldQuestion } from '@mytutor/types';
import { CLASS_SUBJECT_ID, type AskSubjectId } from './subjects';
import type { AskQueue, CropRect, PhotoDraft, Rotation } from './types';

export type Feedback = 'yes' | 'no';

/**
 * What the student does in the ask area on this device. A sent question is a demo event
 * (`ask.sent`) every role sees; only a question taken offline waits here until it can go.
 */
type AskState = {
  /** The photo being prepared: camera or gallery → crop → send. */
  draft: PhotoDraft | null;
  subjectId: AskSubjectId;
  /** Null: the student's own grade. */
  grade: number | null;
  note: string;
  queue: AskQueue;
  /** Questions taken offline, sent as `ask.sent` once the device is online again. */
  queued: WorldQuestion[];
  /** Photos of questions sent from this device, by question id (an inline photo stays here). */
  photos: Record<string, string>;
  feedback: Record<string, Feedback>;
  reportedIds: string[];
  setPhoto: (photo: { uri: string; width: number; height: number }) => void;
  rotate: () => void;
  setCrop: (crop: CropRect | null) => void;
  setSubject: (subjectId: AskSubjectId) => void;
  setGrade: (grade: number) => void;
  setNote: (note: string) => void;
  setQueue: (queue: AskQueue) => void;
  /** Clears the draft for the next photo once it is filed. */
  clearDraft: () => void;
  keepPhoto: (id: string, uri: string) => void;
  enqueue: (question: WorldQuestion) => void;
  dequeue: (id: string) => void;
  /** Drops a question still waiting on the device (a sent one is `ask.cancelled`). */
  cancel: (id: string) => void;
  setFeedback: (id: string, feedback: Feedback) => void;
  report: (id: string) => void;
};

const nextRotation = (r: Rotation): Rotation => ((r + 90) % 360) as Rotation;

export const useAskStore = create<AskState>()((set) => ({
  draft: null,
  subjectId: CLASS_SUBJECT_ID,
  grade: null,
  note: '',
  queue: 'teacher',
  queued: [],
  photos: {},
  feedback: {},
  reportedIds: [],
  setPhoto: (photo) => set({ draft: { ...photo, rotation: 0, crop: null } }),
  rotate: () =>
    set((s) => (s.draft ? { draft: { ...s.draft, rotation: nextRotation(s.draft.rotation) } } : s)),
  setCrop: (crop) => set((s) => (s.draft ? { draft: { ...s.draft, crop } } : s)),
  setSubject: (subjectId) =>
    // Only the class subject has an own teacher; the rest go to the general queue.
    set({ subjectId, queue: subjectId === CLASS_SUBJECT_ID ? 'teacher' : 'general' }),
  setGrade: (grade) => set({ grade }),
  setNote: (note) => set({ note }),
  setQueue: (queue) => set({ queue }),
  clearDraft: () => set({ draft: null, note: '' }),
  keepPhoto: (id, uri) => set((s) => ({ photos: { ...s.photos, [id]: uri } })),
  enqueue: (question) => set((s) => ({ queued: [question, ...s.queued] })),
  dequeue: (id) => set((s) => ({ queued: s.queued.filter((q) => q.id !== id) })),
  cancel: (id) => set((s) => ({ queued: s.queued.filter((q) => q.id !== id) })),
  setFeedback: (id, feedback) => set((s) => ({ feedback: { ...s.feedback, [id]: feedback } })),
  report: (id) => set((s) => ({ reportedIds: [...s.reportedIds, id] })),
}));
