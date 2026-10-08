import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { AppShell } from './components/layout/AppShell';
import { queryClient } from './lib/queryClient';
import { BooksPage } from './routes/BooksPage';
import { CurriculumPage } from './routes/CurriculumPage';
import { NotFoundPage } from './routes/NotFoundPage';
import { TopicPage } from './routes/TopicPage';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<BooksPage />} />
            <Route path="books/:bookId" element={<CurriculumPage />} />
            <Route path="books/:bookId/topics/:number" element={<Navigate to="source" replace />} />
            <Route path="books/:bookId/topics/:number/:tab" element={<TopicPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
