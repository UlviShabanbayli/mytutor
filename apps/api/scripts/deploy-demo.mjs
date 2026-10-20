// Deploys the demo API Worker (`wrangler deploy`). Reads only CLOUDFLARE_API_TOKEN and
// CLOUDFLARE_ACCOUNT_ID from the repo-root .env (or the environment) and never prints them.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';

const KEYS = ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID'];
const file = new URL('../../../.env', import.meta.url);
const fromFile = existsSync(file) ? parseEnv(readFileSync(file, 'utf8')) : {};

const env = { ...process.env };
for (const key of KEYS) env[key] = fromFile[key] ?? process.env[key];
const missing = KEYS.filter((key) => !env[key]);
if (missing.length > 0) {
  console.error(`Missing ${missing.join(' and ')}: add them to the repo-root .env first.`);
  process.exit(1);
}

const result = spawnSync('wrangler', ['deploy', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env,
  shell: process.platform === 'win32',
});
process.exit(result.status ?? 1);
