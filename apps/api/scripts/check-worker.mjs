// Bundles the Worker without uploading it (`wrangler deploy --dry-run`) and fails when the
// bundle reaches for the disk or the content folder: book content must never be deployed.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const outdir = join('.wrangler', 'check');
const build = spawnSync('wrangler', ['deploy', '--dry-run', '--outdir', outdir], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
if (build.status !== 0) process.exit(build.status ?? 1);

const bundle = readFileSync(join(outdir, 'worker.js'), 'utf8');
const FORBIDDEN = ['node:fs', 'readFile(', 'CONTENT_DIR', 'lesson.json', 'quot-riyaziyyat'];
const found = FORBIDDEN.filter((s) => bundle.includes(s));
if (found.length > 0) {
  console.error(`The Worker bundle must not contain: ${found.join(', ')}`);
  process.exit(1);
}
console.log('Worker bundle: demo world only, no content-folder code.');
