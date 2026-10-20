import { create } from 'zustand';
import type { PracticeTest, TestAnswers, TestResult } from '@mytutor/types';
import { registerDemoReset } from '@/lib/demoEvents';
import { useDemoPersonaStore } from '@/lib/demoPersona';
import { countCorrect } from './scoring';

type ActiveSession = {
  testId: string;
  index: number;
  answers: TestAnswers;
  /** Whether the current question's answer has been checked (feedback visible). */
  checked: boolean;
};

type TestSessionState = {
  session: ActiveSession | null;
  /**
   * Finished tests of this app session, newest first: what the device itself did on top of the
   * demo world. In memory only, and forgotten when the demo persona changes.
   */
  results: TestResult[];
  /** Starts a session, or resumes an unfinished one for the same test. */
  start: (testId: string) => void;
  restart: (testId: string) => void;
  /** The student's answer to a question: an option key, or the number typed. */
  select: (questionId: string, answer: string) => void;
  check: () => void;
  next: () => void;
  finish: (test: PracticeTest) => TestResult;
};

const fresh = (testId: string): ActiveSession => ({
  testId,
  index: 0,
  answers: {},
  checked: false,
});

export const useTestSessionStore = create<TestSessionState>((set, get) => ({
  session: null,
  results: [],
  start: (testId) => {
    if (get().session?.testId !== testId) set({ session: fresh(testId) });
  },
  restart: (testId) => set({ session: fresh(testId) }),
  select: (questionId, answer) =>
    set(({ session }) =>
      session && !session.checked
        ? { session: { ...session, answers: { ...session.answers, [questionId]: answer } } }
        : {},
    ),
  check: () => set(({ session }) => (session ? { session: { ...session, checked: true } } : {})),
  next: () =>
    set(({ session }) =>
      session ? { session: { ...session, index: session.index + 1, checked: false } } : {},
    ),
  finish: (test) => {
    const answers = get().session?.answers ?? {};
    const result: TestResult = {
      testId: test.id,
      subjectId: test.subjectId,
      title: test.title,
      correct: countCorrect(test, answers),
      total: test.questions.length,
      answers,
      finishedAt: new Date().toISOString(),
    };
    set(({ results }) => ({ session: null, results: [result, ...results] }));
    return result;
  },
}));

// Another persona is another student: no running test and no finished tests carry over.
useDemoPersonaStore.subscribe((state, previous) => {
  if (state.persona !== previous.persona)
    useTestSessionStore.setState({ session: null, results: [] });
});

// "Demo məlumatını sıfırla": no running test and no finished tests either.
registerDemoReset(() => useTestSessionStore.setState({ session: null, results: [] }));

/** Questions answered today across finished tests (drives the daily goal). */
export function answeredToday(results: TestResult[], now = new Date()): number {
  const today = now.toDateString();
  return results
    .filter((r) => new Date(r.finishedAt).toDateString() === today)
    .reduce((sum, r) => sum + Object.keys(r.answers).length, 0);
}

export const DAILY_GOAL = 10;
