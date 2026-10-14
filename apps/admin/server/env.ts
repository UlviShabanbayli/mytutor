import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';

/**
 * Claude credentials for panel actions that call the API (writing lesson texts), read from the
 * repo-root .env the content engine's CLI also uses. Only the server reads them; the browser
 * never sees them, and Vite refuses to serve .env files.
 */
export function loadClaudeCredentials(envFile: string) {
  if (process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN) return;
  let values: Record<string, string | undefined>;
  try {
    values = parseEnv(readFileSync(envFile, 'utf8'));
  } catch {
    // No .env: actions that need Claude answer "no_api_key".
    return;
  }
  if (values.ANTHROPIC_API_KEY) process.env.ANTHROPIC_API_KEY = values.ANTHROPIC_API_KEY;
}
