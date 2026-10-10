import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Named release, bumped by hand for changes worth a name. */
export const PARSER_RELEASE = '0.3.0';

const SOURCE_DIR = dirname(fileURLToPath(import.meta.url));

/** All parser source files (tests excluded), recursively, in a stable order. */
function sourceFiles(dir: string, prefix = ''): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory()
        ? sourceFiles(join(dir, e.name), `${prefix}${e.name}/`)
        : e.name.endsWith('.ts') && !e.name.endsWith('.test.ts')
          ? [`${prefix}${e.name}`]
          : [],
    )
    .sort();
}

/**
 * The release plus a hash of the parser's own code ("0.3.0+1a2b3c4d"). Any code change yields a
 * new version, so a source.json is never attributed to code that did not produce it.
 */
export function parserVersion(): string {
  const hash = createHash('sha256');
  for (const file of sourceFiles(SOURCE_DIR)) {
    hash.update(file);
    hash.update(readFileSync(join(SOURCE_DIR, file)));
  }
  return `${PARSER_RELEASE}+${hash.digest('hex').slice(0, 8)}`;
}
