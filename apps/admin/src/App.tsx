import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { AppShell } from './components/layout/AppShell';
import { STANDARDS_ENABLED } from './lib/features';
import { queryClient } from './lib/queryClient';
import { BooksPage } from './routes/BooksPage';
import { CurriculaPage } from './routes/CurriculaPage';
import { CurriculumPage } from './routes/CurriculumPage';
import { StandardSetsPage } from './routes/StandardSetsPage';
import { StandardSetEditorPage } from './routes/StandardSetEditorPage';
import { GuidePage } from './routes/GuidePage';
import { LessonPage } from './routes/LessonPage';
import { BookPage } from './routes/BookPage';
import { NotFoundPage } from './routes/NotFoundPage';
import { OverviewPage } from './routes/OverviewPage';
import { ReviewPage } from './routes/ReviewPage';
import { ReviewQueuePage } from './routes/ReviewQueuePage';
import { TestBookPage } from './routes/TestBookPage';
import { TestBooksPage } from './routes/TestBooksPage';
import { TopicPage } from './routes/TopicPage';
import { TrashPage } from './routes/TrashPage';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<OverviewPage />} />
            <Route path="books" element={<BooksPage />} />
            <Route path="books/:bookId" element={<BookPage tab="topics" />} />
            {STANDARDS_ENABLED ? (
              <Route path="books/:bookId/standards" element={<BookPage tab="standards" />} />
            ) : null}
            <Route path="books/:bookId/topics/:number" element={<Navigate to="source" replace />} />
            <Route path="books/:bookId/topics/:number/review" element={<ReviewPage />} />
            <Route path="books/:bookId/topics/:number/:tab" element={<TopicPage />} />
            <Route path="review" element={<ReviewQueuePage />} />
            <Route path="curricula" element={<CurriculaPage />} />
            <Route path="curricula/:curriculumId" element={<CurriculumPage tab="textbooks" />} />
            <Route
              path="curricula/:curriculumId/topics"
              element={<CurriculumPage tab="topics" />}
            />
            <Route
              path="curricula/:curriculumId/lessons/:bookId/:number"
              element={<LessonPage />}
            />
            {STANDARDS_ENABLED ? (
              <>
                <Route path="standards" element={<StandardSetsPage />} />
                <Route path="standards/:standardSetId" element={<StandardSetEditorPage />} />
              </>
            ) : null}
            <Route path="test-books" element={<TestBooksPage />} />
            <Route path="test-books/:testBookId" element={<TestBookPage />} />
            <Route path="trash" element={<TrashPage />} />
            <Route path="guide" element={<GuidePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
