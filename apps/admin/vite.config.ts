import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { contentPlugin } from './server/contentPlugin';

const here = fileURLToPath(new URL('.', import.meta.url));

// Folder with parser / content-engine outputs (gitignored; the textbook is not in the repo).
const contentRoot = resolve(
  process.env.MYTUTOR_CONTENT_DIR ?? resolve(here, '../../packages/textbook-parser/out'),
);

export default defineConfig({
  plugins: [react(), contentPlugin(contentRoot)],
  resolve: { alias: { '@': resolve(here, 'src') } },
  server: { port: 5180 },
});
