// Commands shown in empty states so the team knows how to produce missing pipeline outputs.
// The textbook PDF is not in the repo (license), so its path is a placeholder.
export const commands = {
  split: 'pnpm --filter @mytutor/textbook-parser split <dərslik.pdf>',
  source: (topic: string) =>
    `pnpm --filter @mytutor/textbook-parser source <dərslik.pdf> --topic ${topic}`,
  knowledge: (topicDir: string) =>
    `pnpm --filter @mytutor/content-engine knowledge ../textbook-parser/out/${topicDir}`,
};
