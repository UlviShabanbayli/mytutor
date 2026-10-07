import type { z } from 'zod';
import type {
  answerOptionSchema,
  apiErrorSchema,
  healthResponseSchema,
  localeSchema,
  optionKeySchema,
  otpCodeSchema,
  phoneNumberSchema,
  practiceTestSchema,
  questionSchema,
  sourceRefSchema,
  subjectSchema,
  topicSchema,
} from '@mytutor/schemas';

// Types inferred from shared schemas. Domain types without a schema are declared here.
export type PhoneNumber = z.output<typeof phoneNumberSchema>;
export type OtpCode = z.output<typeof otpCodeSchema>;
export type Locale = z.output<typeof localeSchema>;
export type ApiError = z.output<typeof apiErrorSchema>;
export type HealthResponse = z.output<typeof healthResponseSchema>;

export type OptionKey = z.output<typeof optionKeySchema>;
export type SourceRef = z.output<typeof sourceRefSchema>;
export type AnswerOption = z.output<typeof answerOptionSchema>;
export type Question = z.output<typeof questionSchema>;
export type Subject = z.output<typeof subjectSchema>;
export type Topic = z.output<typeof topicSchema>;
export type PracticeTest = z.output<typeof practiceTestSchema>;

/** The student's answers in one test session, keyed by question id. */
export type TestAnswers = Record<string, OptionKey>;

/** Outcome of a finished test session. */
export type TestResult = {
  testId: string;
  subjectId: string;
  title: string;
  correct: number;
  total: number;
  answers: TestAnswers;
  finishedAt: string;
};
