import { create } from 'zustand';
import { queryClient } from '@/lib/queryClient';
import { extractTopicSource } from './api';

type Run = { done: number; total: number; current: string | null; error: unknown };

type ExtractQueueState = {
  runs: Record<string, Run>;
  /** Extracts the topics one by one (the server runs one extraction per topic). */
  start: (bookId: string, topics: string[]) => Promise<void>;
};

/**
 * "Extract every missing source" of a book. Kept outside any page, so the run continues and its
 * progress stays visible while the editor moves around the panel.
 */
export const useExtractQueue = create<ExtractQueueState>()((set, get) => ({
  runs: {},
  start: async (bookId, topics) => {
    const running = get().runs[bookId];
    if (running && running.done < running.total && !running.error) return;
    const update = (run: Partial<Run>) =>
      set((s) => ({
        runs: { ...s.runs, [bookId]: { ...(s.runs[bookId] ?? EMPTY), ...run } },
      }));
    update({ done: 0, total: topics.length, current: null, error: null });
    for (const [i, topic] of topics.entries()) {
      update({ current: topic });
      try {
        await extractTopicSource(bookId, topic);
      } catch (error) {
        update({ error, current: null });
        void queryClient.invalidateQueries({ queryKey: ['content'] });
        return;
      }
      update({ done: i + 1 });
      void queryClient.invalidateQueries({ queryKey: ['content'] });
    }
    update({ current: null });
  },
}));

const EMPTY: Run = { done: 0, total: 0, current: null, error: null };

export const isRunning = (run: Run | undefined) =>
  Boolean(run && run.done < run.total && !run.error);
