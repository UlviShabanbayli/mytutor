import { existsSync } from 'node:fs';
import { answerKey, bookAnswers, bookLesson } from './bookContent';
import type { ContentProvider } from './content';
import { publishedTests } from './publishedTests';

/**
 * The local content folder (CONTENT_DIR, by default packages/textbook-parser/out): published
 * tests, approved lesson texts and book answers. Null when the folder does not exist, so a fresh
 * clone serves the demo world only.
 */
export function contentDirProvider(contentDir: string): ContentProvider | null {
  if (!existsSync(contentDir)) return null;
  const key = answerKey(contentDir);
  return {
    tests: publishedTests(contentDir),
    bookLesson: (topicId) => bookLesson(contentDir, topicId),
    bookAnswers: (topicId) => bookAnswers(key, topicId),
  };
}
