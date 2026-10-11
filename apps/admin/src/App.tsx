import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { AppShell } from './components/layout/AppShell';
import { queryClient } from './lib/queryClient';
import { BooksPage } from './routes/BooksPage';
import { CurriculaPage } from './routes/CurriculaPage';
import { CurriculumEditorPage } from './routes/CurriculumEditorPage';
import { GuidePage } from './routes/GuidePage';
import { BookPage } from './routes/BookPage';
import { NotFoundPage } from './routes/NotFoundPage';
import { TopicPage } from './routes/TopicPage';
import { TrashPage } from './routes/TrashPage';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<BooksPage />} />
            <Route path="books/:bookId" element={<BookPage tab="topics" />} />
            <Route path="books/:bookId/curriculum" element={<BookPage tab="curriculum" />} />
            <Route path="books/:bookId/topics/:number" element={<Navigate to="source" replace />} />
            <Route path="books/:bookId/topics/:number/:tab" element={<TopicPage />} />
            <Route path="curricula" element={<CurriculaPage />} />
            <Route path="curricula/:curriculumId" element={<CurriculumEditorPage />} />
            <Route path="trash" element={<TrashPage />} />
            <Route path="guide" element={<GuidePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
