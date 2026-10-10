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
  server: {
    port: 5180,
    fs: {
      // Vite's defaults (a custom list replaces them) plus textbook PDFs, which are licensed
      // CC BY-NC-SA and must never be served to the browser, not even through /@fs/.
      deny: [
        '.env',
        '.env.*',
        '*.{crt,pem,key,p12,pfx,cer,der}',
        '.npmrc',
        '.yarnrc.yml',
        '**/.git/**',
        '**/*.pdf',
        '**/*.pdf.part',
      ],
    },
  },
});
