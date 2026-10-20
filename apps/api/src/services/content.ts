import type { BookAnswers, BookLesson, PracticeTest, Subject, Topic } from '@mytutor/types';

/**
 * Content that is not ours to publish: the published DİM tests, approved lesson texts and the
 * book's answers. Only the local Node API has it (from CONTENT_DIR); the Worker never does.
 * These types import nothing from Node, so the app factory stays runtime-agnostic.
 */

/** The app's test practice: subjects → topics → a test with its questions, and their figures. */
export type TestsStore = {
  subjects(): Promise<Subject[]>;
  subject(id: string): Promise<{ subject: Subject; topics: Topic[] } | null>;
  test(id: string): Promise<PracticeTest | null>;
  recommended(): Promise<Topic | null>;
  /** A published figure's bytes, or null for a name that is not one. */
  media(file: string): Promise<Uint8Array<ArrayBuffer> | null>;
};

export type ContentProvider = {
  tests: TestsStore;
  /** A topic's approved lesson text; null when there is none. */
  bookLesson(topicId: string): Promise<BookLesson | null>;
  /** The book's answers on a topic's pages; null when the book has no answer key here. */
  bookAnswers(topicId: string): Promise<BookAnswers | null>;
};

/** No published tests: what the Worker serves on /tests. */
export const noTests: TestsStore = {
  subjects: async () => [],
  subject: async () => null,
  test: async () => null,
  recommended: async () => null,
  media: async () => null,
};
