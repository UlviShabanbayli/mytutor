import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { minutesBetween } from './time';

type StudyState = {
  /** Where each lesson video was left, in seconds (resume position); kept on the device. */
  videoPositions: Record<string, number>;
  /** When each lesson and test was opened this time (for "9 dəq" and "6:40"). */
  lessonStarts: Record<string, number>;
  lessonMinutes: Record<string, number>;
  testStarts: Record<string, number>;
  setVideoPosition: (key: string, seconds: number) => void;
  startLesson: (lessonId: string) => void;
  finishLesson: (lessonId: string) => void;
  /** Marks when a test run began; a resumed run keeps its first start. */
  startTest: (testId: string, fresh: boolean) => void;
};

export const useStudyStore = create<StudyState>()(
  persist(
    (set) => ({
      videoPositions: {},
      lessonStarts: {},
      lessonMinutes: {},
      testStarts: {},
      setVideoPosition: (key, seconds) =>
        set((s) => ({ videoPositions: { ...s.videoPositions, [key]: seconds } })),
      startLesson: (lessonId) =>
        set((s) =>
          s.lessonStarts[lessonId]
            ? {}
            : { lessonStarts: { ...s.lessonStarts, [lessonId]: Date.now() } },
        ),
      finishLesson: (lessonId) =>
        set((s) => {
          const started = s.lessonStarts[lessonId] ?? Date.now();
          const lessonStarts = { ...s.lessonStarts };
          delete lessonStarts[lessonId];
          return {
            lessonStarts,
            lessonMinutes: { ...s.lessonMinutes, [lessonId]: minutesBetween(started, Date.now()) },
          };
        }),
      startTest: (testId, fresh) =>
        set((s) =>
          fresh || !s.testStarts[testId]
            ? { testStarts: { ...s.testStarts, [testId]: Date.now() } }
            : {},
        ),
    }),
    {
      name: 'ari-study',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ videoPositions }) => ({ videoPositions }),
    },
  ),
);
