import { create } from 'zustand';
import type { ChatMessage } from './types';

type ChatState = {
  /** The private thread (architecture Ş9: teachers and parents never see it). */
  messages: ChatMessage[];
  /** Student messages sent today, counted against the free plan's daily limit. */
  used: number;
  /** Vızı is preparing a reply. */
  thinking: boolean;
  add: (message: ChatMessage) => void;
  countMessage: () => void;
  setThinking: (thinking: boolean) => void;
  clear: () => void;
};

/** Kept in memory for the demo; the AI chat API stores threads on the server. */
export const useChatStore = create<ChatState>()((set) => ({
  messages: [],
  used: 0,
  thinking: false,
  add: (message) => set((s) => ({ messages: [...s.messages, message] })),
  countMessage: () => set((s) => ({ used: s.used + 1 })),
  setThinking: (thinking) => set({ thinking }),
  // Clearing the thread does not give back today's messages.
  clear: () => set({ messages: [], thinking: false }),
}));
