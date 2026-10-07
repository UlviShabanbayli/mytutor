#!/usr/bin/env tsx
// Usage: pnpm --filter @mytutor/textbook-parser split <book.pdf> [--out <dir>]
// Writes structure.json and report.md for review, and prints the report.
import { mkdir, writeFile } from 'node:fs/promises';
import { basename, extname, join, resolve } from 'node:path';
import { renderReport, splitTextbook } from './index';

async function main() {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith('--'));
  const outIndex = args.indexOf('--out');
  if (!file) {
    console.error('İstifadə: split <kitab.pdf> [--out <qovluq>]');
    process.exit(1);
  }
  const outDir = resolve(
    outIndex >= 0 && args[outIndex + 1]
      ? (args[outIndex + 1] ?? '')
      : join('out', basename(file, extname(file))),
  );

  const structure = await splitTextbook(resolve(file));
  const report = renderReport(structure);
  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, 'structure.json'), `${JSON.stringify(structure, null, 2)}\n`);
  await writeFile(join(outDir, 'report.md'), report);

  console.log(report);
  console.log(`Yazıldı: ${join(outDir, 'structure.json')}, ${join(outDir, 'report.md')}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
