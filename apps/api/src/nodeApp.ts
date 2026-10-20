import { createApp, type AppOptions } from './app';
import { contentDirProvider } from './services/contentDir';

/**
 * The local API: the demo world plus, when the content folder exists, the published DİM tests,
 * approved lesson texts and book answers from it.
 */
export function createNodeApp({
  contentDir,
  ...options
}: Omit<AppOptions, 'content'> & { contentDir: string }) {
  const content = contentDirProvider(contentDir);
  return {
    app: createApp({ ...options, ...(content ? { content } : {}) }),
    hasContent: content !== null,
  };
}
