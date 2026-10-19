import { addTestBookResponseSchema, deleteTestBookResponseSchema } from '@mytutor/schemas';
import type { SubjectId } from '@mytutor/types';
import { runAction } from '@/features/content/api';

/** Uploads a test book's PDF for a subject; the server keeps it apart from the textbooks. */
export const addTestBook = (file: File, title: string, subject: SubjectId) =>
  runAction(['test-books'], addTestBookResponseSchema, {
    body: file,
    headers: {
      'Content-Type': 'application/pdf',
      // Header values must be ASCII; the server decodes them.
      'X-File-Name': encodeURIComponent(file.name),
      'X-Book-Title': encodeURIComponent(title),
      'X-Subject': subject,
    },
  });

/** Moves a test book to the test-book trash; nothing is erased. */
export const deleteTestBook = (testBookId: string) =>
  runAction(['test-books', testBookId], deleteTestBookResponseSchema, { method: 'DELETE' });
