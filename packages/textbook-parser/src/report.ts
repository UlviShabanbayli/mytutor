import type { TextbookBlockKind, TextbookStructure } from '@mytutor/types';

const KIND_LABEL: Record<TextbookBlockKind, string> = {
  pretest: 'İlkin yoxlama',
  problems: 'Məsələ və misallar',
  summary: 'Xülasə',
  review: 'Ümumiləşdirici tapşırıqlar',
  steam: 'STEAM',
  glossary: 'Sözlük',
  answers: 'Cavablar',
  other: 'Digər',
};

/** Standard blocks read better in sentence case; anything else keeps the book's wording. */
function displayTitle(kind: TextbookBlockKind, title: string): string {
  const label = KIND_LABEL[kind];
  const same = title.toLocaleUpperCase('az') === label.toLocaleUpperCase('az');
  return kind !== 'other' && kind !== 'steam' && same ? label : title;
}

/** Human-readable review report (Azerbaijani) for checking the split against the book. */
export function renderReport(s: TextbookStructure): string {
  const offset = s.source.printedPageOffset;
  const pages = (start: number, end: number) => {
    const pdf = start === end ? `${start}` : `${start}–${end}`;
    if (offset === null) return `PDF ${pdf}`;
    const a = start - offset;
    const b = end - offset;
    return `PDF ${pdf} · kitab ${a === b ? a : `${a}–${b}`}`;
  };

  const out: string[] = [`# ${s.source.file}`, ''];
  out.push(`${s.source.pageCount} PDF səhifəsi.`);
  out.push(
    offset === null
      ? 'Kitabın səhifə nömrələri oxunmadı.'
      : `Kitab səhifəsi = PDF səhifəsi − ${offset}.`,
    '',
    '## Yoxlama',
    '',
  );

  for (const [unit, count] of Object.entries(s.validation.detectedTopicCounts)) {
    const toc = s.validation.tocTopicCounts[unit];
    const ok = toc === count;
    out.push(
      `- ${ok ? '✅' : '⚠️'} Bölmə ${unit}: ${count} mövzu tapıldı${toc === undefined ? '' : `, mündəricatda ${toc}`}`,
    );
  }
  if (s.validation.warnings.length > 0) {
    out.push('', '**Diqqət:**', ...s.validation.warnings.map((w) => `- ⚠️ ${w}`));
  }

  out.push('', '## Struktur', '');
  for (const u of s.units) {
    out.push(`### ${u.index}-ci bölmə. ${u.title}`, `_${pages(u.startPage, u.endPage)}_`, '');
    for (const item of u.items) {
      if (item.type === 'topic') {
        out.push(`- **${item.number}. ${item.title}** — ${pages(item.startPage, item.endPage)}`);
        for (const sec of item.sections) out.push(`  - ${sec.title} _(PDF ${sec.page})_`);
      } else {
        const title = displayTitle(item.kind, item.title);
        out.push(`- _${title}_ — ${pages(item.startPage, item.endPage)}`);
      }
    }
    out.push('');
  }

  if (s.backMatter.length > 0) {
    out.push('## Kitabın sonu', '');
    for (const b of s.backMatter) {
      const title = displayTitle(b.kind, b.title);
      out.push(`- _${title}_ — ${pages(b.startPage, b.endPage)}`);
    }
  }
  return `${out.join('\n')}\n`;
}
