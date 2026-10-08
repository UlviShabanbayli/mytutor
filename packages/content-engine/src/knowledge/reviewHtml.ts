import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import katex from 'katex';
import type { KnowledgeDocument, KnowledgeItem, TopicSource } from '@mytutor/types';

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c);
/** MathML needs no stylesheet, so the page stays self-contained. */
const tex = (latex: string) => {
  try {
    return katex.renderToString(latex, { output: 'mathml', throwOnError: true, strict: 'ignore' });
  } catch {
    return `<code>${esc(latex)}</code>`;
  }
};
const STATUS = {
  textbook: ['Dərslik', '#15803d'],
  derived: ['Törəmə', '#2563eb'],
  unverified: ['Təsdiqlənməyib', '#c81e1e'],
} as const;
const CHECK = { pass: '✓', fail: '✗', skip: '–' } as const;
const TYPE: Record<KnowledgeItem['type'], string> = {
  definition: 'Tərif',
  rule: 'Qayda',
  formula: 'Düstur',
  worked_example: 'NÜMUNƏ (həll)',
  exercise: 'Tapşırıq',
  question: 'Sual',
  figure: 'Fiqur',
  term: 'Termin',
  prerequisite: 'Əvvəlki bilik',
};

type MathText = { text: string | null; latex: string | null };
const mt = (m: MathText) =>
  [m.text ? esc(m.text) : '', m.latex ? tex(m.latex) : ''].filter(Boolean).join(' ');

function body(item: KnowledgeItem): string {
  const c = item.content as Record<string, unknown>;
  switch (item.type) {
    case 'formula':
      return `${c.name ? `<p class="name">${esc(String(c.name))}</p>` : ''}<p class="math">${tex(String(c.latex))}</p><p class="spoken">🔈 ${esc(String(c.spoken))}</p>`;
    case 'worked_example': {
      const steps = (c.steps as MathText[]).map((s) => `<li>${mt(s)}</li>`).join('');
      return `<p><strong>${esc(String(c.label))}</strong> ${mt(c.problem as MathText)}</p><ol class="steps">${steps}</ol>${c.explanation ? `<p class="expl">Açıqlama: ${esc(String(c.explanation))}</p>` : ''}`;
    }
    case 'exercise': {
      const items = (c.items as (MathText & { label: string })[])
        .map((i) => `<li><b>${esc(i.label)})</b> ${mt(i)}</li>`)
        .join('');
      return `<p><strong>${esc(String(c.number))}.</strong> ${esc(String(c.instruction))}</p>${items ? `<ul class="subs">${items}</ul>` : ''}`;
    }
    case 'definition':
      return `<p><strong>${esc(String(c.concept))}:</strong> ${esc(String(c.statement))}</p>`;
    case 'rule':
      return `<p>${esc(String(c.statement))}</p>${c.latex ? `<p class="math">${tex(String(c.latex))}</p>` : ''}`;
    case 'question':
      return `<p>${esc(String(c.text))}</p>${c.latex ? `<p class="math">${tex(String(c.latex))}</p>` : ''}`;
    case 'figure':
      return `<p>${esc(String(c.description))}</p><p class="muted">Etiketlər: ${esc((c.labels as string[]).join(', '))}</p>`;
    case 'term':
      return `<p><strong>${esc(String(c.term))}</strong> — <span class="muted">${esc(String(c.context))}</span></p>`;
    case 'prerequisite':
      return `<p>${esc(String(c.statement))}</p>`;
  }
}

export async function renderKnowledgeReview(
  doc: KnowledgeDocument,
  source: TopicSource,
  topicDir: string,
  { inline }: { inline: boolean },
) {
  const img = async (path: string) =>
    inline
      ? `data:image/png;base64,${(await readFile(join(topicDir, path))).toString('base64')}`
      : `../${path}`;
  const blockLabel = (id: string) => {
    const b = source.blocks.find((x) => x.id === id);
    return b
      ? [b.label, b.number ? `№ ${b.number}` : null, b.title].filter(Boolean).join(' · ') || b.kind
      : id;
  };

  const cards: string[] = [];
  for (const item of doc.items) {
    const [statusLabel, color] = STATUS[item.status];
    const refs = item.sources
      .map(
        (s) =>
          `${s.blockId} (${esc(blockLabel(s.blockId))})${s.lineIds.length ? ` · sətirlər ${s.lineIds.join(', ')}` : ''}${s.figureId ? ` · ${s.figureId}` : ''} · kitab səh. ${[...new Set(s.regions.map((r) => r.printedPage))].join(', ')}`,
      )
      .join('<br>');
    const firstCrop = item.sources[0]?.crops[0];
    const checks = item.checks
      .map(
        (c) =>
          `<li class="${c.result}">${CHECK[c.result]} ${c.name}${c.detail ? ` — ${esc(c.detail)}` : ''}</li>`,
      )
      .join('');
    cards.push(`<article class="item" style="--c:${color}" id="${item.id}">
      <header><code>${item.id}</code><span class="type">${TYPE[item.type]}</span><span class="status">${statusLabel}</span><span class="muted">${item.readFrom === 'image' ? 'şəkildən' : 'mətndən'}</span></header>
      ${body(item)}
      <p class="refs">Mənbə: ${refs}</p>
      <details><summary>Yoxlamalar${firstCrop ? ' və mənbə kəsiyi' : ''}</summary><ul class="checks">${checks}</ul>${firstCrop ? `<img src="${await img(firstCrop)}" alt="Mənbə kəsiyi">` : ''}</details>
    </article>`);
  }

  const s = doc.summary;
  const fresh = doc.aiCalls.filter((c) => !c.cached);
  return `<title>${esc(`${doc.topic.number} ${doc.topic.title} bilik`)}</title>
<style>
:root{--bg:#f7f5fc;--fg:#1a1530;--muted:#5b5675;--line:#e4def2;--card:#fff}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0e0b1a;--fg:#f5f3ff;--muted:#a9a3c4;--line:#2e2750;--card:#1a1530;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#0e0b1a;--fg:#f5f3ff;--muted:#a9a3c4;--line:#2e2750;--card:#1a1530;color-scheme:dark}
*{box-sizing:border-box}body{background:var(--bg);color:var(--fg);font:15px/1.55 "Segoe UI",system-ui,sans-serif}
main{max-width:980px;margin:0 auto;padding-inline:16px;padding-block:24px 48px;display:grid;gap:14px}
h1{margin:0;font-size:26px}.muted{color:var(--muted)}.stats{display:flex;flex-wrap:wrap;gap:10px}
.stat{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:8px 14px}.stat b{font-size:22px;display:block}
.item{background:var(--card);border:1px solid var(--line);border-left:5px solid var(--c);border-radius:12px;padding:10px 14px;display:grid;gap:6px;min-width:0}
.item header{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.type{font-weight:700}.status{background:var(--c);color:#fff;border-radius:999px;padding:0 9px;font-size:12px;font-weight:700}
.item p{margin:0}.math{font-size:20px;overflow-x:auto}.name{font-weight:600}.spoken,.refs,.expl{font-size:13px;color:var(--muted)}
.steps,.subs{margin:0;padding-left:22px}.checks{list-style:none;padding:0;margin:6px 0;font-size:13px}.checks .fail{color:#c81e1e}.checks .pass{color:#15803d}
details img{max-width:100%;border:1px solid var(--line);border-radius:6px;background:#fff}code{font-size:12px}
</style>
<main>
<h1>${esc(`${doc.topic.number}. ${doc.topic.title}`)} — bilik sənədi</h1>
<p class="muted">Prompt ${esc(doc.prompts.extract)} / ${esc(doc.prompts.verify)} · model ${esc([...new Set(doc.aiCalls.map((c) => c.model))].join(', '))} · mənbə ${esc(doc.source.sourceSha256.slice(0, 12))}</p>
<div class="stats">
<div class="stat"><b>${s.textbook}</b>dərslik</div><div class="stat"><b>${s.derived}</b>törəmə</div><div class="stat"><b>${s.unverified}</b>təsdiqlənməyib</div>
<div class="stat"><b>${s.imageBasedFormulas.length}</b>şəkildən düstur</div><div class="stat"><b>${doc.aiCalls.length}</b>AI çağırışı (${fresh.length} yeni)</div><div class="stat"><b>$${s.costUsd}</b>xərc</div>
</div>
${cards.join('\n')}
</main>`;
}
