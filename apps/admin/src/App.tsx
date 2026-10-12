import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { AppShell } from './components/layout/AppShell';
import { queryClient } from './lib/queryClient';
import { BooksPage } from './routes/BooksPage';
import { StandardSetsPage } from './routes/StandardSetsPage';
import { StandardSetEditorPage } from './routes/StandardSetEditorPage';
import { GuidePage } from './routes/GuidePage';
import { BookPage } from './routes/BookPage';
import { NotFoundPage } from './routes/NotFoundPage';
import { OverviewPage } from './routes/OverviewPage';
import { ReviewPage } from './routes/ReviewPage';
import { ReviewQueuePage } from './routes/ReviewQueuePage';
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
            <Route path="books/:bookId/standards" element={<BookPage tab="standards" />} />
            <Route path="books/:bookId/topics/:number" element={<Navigate to="source" replace />} />
            <Route path="books/:bookId/topics/:number/review" element={<ReviewPage />} />
            <Route path="books/:bookId/topics/:number/:tab" element={<TopicPage />} />
            <Route path="review" element={<ReviewQueuePage />} />
            <Route path="standards" element={<StandardSetsPage />} />
            <Route path="standards/:standardSetId" element={<StandardSetEditorPage />} />
            <Route path="trash" element={<TrashPage />} />
            <Route path="guide" element={<GuidePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
