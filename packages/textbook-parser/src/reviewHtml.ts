import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { loadImage, createCanvas } from '@napi-rs/canvas';
import type { SourceBlockKind, TopicSource } from '@mytutor/types';

const KIND: Record<SourceBlockKind, { label: string; color: string }> = {
  title: { label: 'Başlıq', color: '#6366f1' },
  inquiry: { label: 'Araşdırma-müzakirə', color: '#0d9488' },
  section: { label: 'Öyrənmə / bölüm', color: '#2563eb' },
  think: { label: 'Fikirləş!', color: '#65a30d' },
  remember: { label: 'Yadda saxla!', color: '#9333ea' },
  find_mistake: { label: 'Səhvi düzəlt!', color: '#16a34a' },
  history: { label: 'Riyaziyyat tarixindən', color: '#ca8a04' },
  exercises: { label: 'Çalışma', color: '#64748b' },
  problems: { label: 'Məsələ həlli', color: '#e11d48' },
  exercise: { label: 'Tapşırıq', color: '#ea580c' },
  example: { label: 'NÜMUNƏ', color: '#0284c7' },
  theorem: { label: 'Teorem', color: '#7c3aed' },
  callout: { label: 'Tanınmayan', color: '#dc2626' },
};

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c);

/** Page images can be inlined (as JPEG) so the review is one shareable file. */
async function src(outDir: string, path: string, inline: boolean, jpeg = false): Promise<string> {
  if (!inline) return path;
  const buf = await readFile(join(outDir, path));
  if (!jpeg) return `data:image/png;base64,${buf.toString('base64')}`;
  const img = await loadImage(buf);
  const c = createCanvas(img.width, img.height);
  c.getContext('2d').drawImage(img, 0, 0);
  return `data:image/jpeg;base64,${c.toBuffer('image/jpeg', 78).toString('base64')}`;
}

/** Side-by-side review: page with block boxes, and the extracted data per block. */
export async function renderReview(
  s: TopicSource,
  outDir: string,
  { inline }: { inline: boolean },
): Promise<string> {
  const lineById = new Map(s.lines.map((l) => [l.id, l]));
  const figById = new Map(s.figures.map((f) => [f.id, f]));
  const pageHtml: string[] = [];
  for (const p of s.pages) {
    const boxes = s.blocks.flatMap((b) =>
      b.regions
        .filter((r) => r.page === p.page)
        .map((r) => {
          const k = KIND[b.kind];
          const style = `left:${(r.bbox.x / p.width) * 100}%;top:${(r.bbox.y / p.height) * 100}%;width:${(r.bbox.width / p.width) * 100}%;height:${(r.bbox.height / p.height) * 100}%;--c:${k.color}`;
          return `<a class="box${b.parentId ? ' child' : ''}" href="#${b.id}" style="${style}"><span>${b.id} · ${esc(k.label)}${b.number ? ` ${esc(b.number)}` : ''}</span></a>`;
        }),
    );
    const figs = s.figures
      .filter((f) => f.region.page === p.page)
      .map(
        (f) =>
          `<div class="fig" style="left:${(f.region.bbox.x / p.width) * 100}%;top:${(f.region.bbox.y / p.height) * 100}%;width:${(f.region.bbox.width / p.width) * 100}%;height:${(f.region.bbox.height / p.height) * 100}%"><span>${f.id}</span></div>`,
      );
    pageHtml.push(
      `<figure class="page"><figcaption>PDF səh. ${p.page} · kitab səh. ${p.printedPage ?? '—'}</figcaption><div class="sheet"><img src="${await src(outDir, p.image, inline, true)}" alt="Səhifə ${p.page}">${boxes.join('')}${figs.join('')}</div></figure>`,
    );
  }

  const blockHtml: string[] = [];
  for (const b of s.blocks) {
    const k = KIND[b.kind];
    const lines = b.lineIds.map((id) => lineById.get(id)).filter((l) => l !== undefined);
    const flags = [
      b.flags.hasMath && 'düstur',
      b.flags.hasFigure && 'fiqur',
      b.flags.lowTextQuality && 'mətn keyfiyyəti aşağı',
    ].filter(Boolean);
    const crops = await Promise.all(
      b.crops.map(
        async (c) => `<img class="crop" src="${await src(outDir, c, inline)}" alt="${b.id} kəsik">`,
      ),
    );
    const figs = await Promise.all(
      b.figureIds.map(async (id) => {
        const f = figById.get(id);
        return f
          ? `<li>${f.id} · ${f.kind} · səh. ${f.region.printedPage ?? f.region.page}${f.labels.length ? ` · etiketlər: ${esc(f.labels.join(', '))}` : ''}</li>`
          : '';
      }),
    );
    blockHtml.push(`<article id="${b.id}" class="block" style="--c:${k.color}">
      <header><strong>${b.id}</strong><span class="kind">${esc(k.label)}</span>${b.number ? `<span class="num">№ ${esc(b.number)}</span>` : ''}${b.parentId ? `<a class="parent" href="#${b.parentId}">↑ ${b.parentId}</a>` : ''}</header>
      ${b.label || b.title ? `<p class="title">${esc([b.label, b.title].filter(Boolean).join(' — '))}</p>` : ''}
      <p class="meta">Mənbə: ${b.regions.map((r) => `kitab səh. ${r.printedPage ?? '—'} (PDF ${r.page})`).join(', ')}${flags.length ? ` · ${flags.join(' · ')}` : ''}</p>
      ${crops.join('')}
      ${figs.length ? `<ul class="figs">${figs.join('')}</ul>` : ''}
      ${lines.length ? `<details><summary>${lines.length} sətir (mətn qatı)</summary><ol class="lines">${lines.map((l) => `<li class="${l.math ? 'math' : ''} ${l.quality}"><code>${l.id}</code> ${esc(l.text)}</li>`).join('')}</ol></details>` : ''}
    </article>`);
  }

  return `<title>${esc(`${s.topic.number} ${s.topic.title}`)}</title>
<style>
:root{--bg:#f7f5fc;--fg:#1a1530;--muted:#5b5675;--line:#e4def2;--card:#fff}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0e0b1a;--fg:#f5f3ff;--muted:#a9a3c4;--line:#2e2750;--card:#1a1530;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#0e0b1a;--fg:#f5f3ff;--muted:#a9a3c4;--line:#2e2750;--card:#1a1530;color-scheme:dark}
*{box-sizing:border-box}body{background:var(--bg);color:var(--fg);font:15px/1.5 "Segoe UI",system-ui,sans-serif}
main{max-width:1400px;margin:0 auto;padding-inline:16px;padding-block:24px 48px;display:grid;gap:20px}
h1{font-size:26px;margin:0}.muted{color:var(--muted)}
.warn{background:#fef3c7;color:#92400e;border-radius:12px;padding:10px 14px}
.grid{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:20px;align-items:start}
@media (max-width:900px){.grid{grid-template-columns:1fr}}
.pages{display:grid;gap:16px}.page{margin:0}.page figcaption{font-weight:700;margin-bottom:6px}
.sheet{position:relative;border:1px solid var(--line);border-radius:8px;overflow:hidden;background:#fff}.sheet img{display:block;width:100%}
.box{position:absolute;border:2px solid var(--c);background:color-mix(in srgb,var(--c) 7%,transparent);text-decoration:none}
.box.child{border-style:dashed}.box span{position:absolute;top:0;left:0;background:var(--c);color:#fff;font-size:11px;font-weight:700;padding:0 5px;white-space:nowrap}
.box.child span{top:auto;bottom:0;right:0;left:auto}
.fig{position:absolute;border:2px dotted #111;pointer-events:none}.fig span{position:absolute;right:0;top:0;background:#111;color:#fff;font-size:10px;padding:0 4px}
.blocks{display:grid;gap:12px}
.block{background:var(--card);border:1px solid var(--line);border-left:5px solid var(--c);border-radius:10px;padding:10px 14px;display:grid;gap:6px;min-width:0}
.block header{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.kind{background:var(--c);color:#fff;border-radius:999px;padding:0 8px;font-size:12px;font-weight:700}
.num{font-weight:700}.parent{margin-left:auto;font-size:12px}.title{margin:0;font-weight:600}.meta{margin:0;font-size:13px;color:var(--muted)}
.crop{max-width:100%;border:1px solid var(--line);border-radius:6px;background:#fff}
.lines{margin:6px 0 0;padding-left:20px;font-size:13px}.lines li.math{color:#7c3aed}.lines li.low{text-decoration:underline wavy #f59e0b}
code{font-size:11px;color:var(--muted)}.figs{margin:0;padding-left:18px;font-size:13px}
</style>
<main>
  <header><h1>${esc(`${s.topic.number}. ${s.topic.title}`)}</h1>
  <p class="muted">${esc(s.topic.unit.index + '-ci bölmə: ' + s.topic.unit.title)} · ${esc(s.book.file)} · parser ${esc(s.parserVersion)} · ${s.blocks.length} blok, ${s.lines.length} sətir, ${s.figures.length} fiqur. Bənövşəyi sətirlər düsturludur (mətn qatı natamam ola bilər, şəkil əsasdır); dalğalı xətt mətn keyfiyyətinin aşağı olduğunu göstərir.</p></header>
  ${s.warnings.length ? `<div class="warn">${s.warnings.map((w) => `⚠️ ${esc(w)}`).join('<br>')}</div>` : ''}
  <div class="grid"><section class="pages">${pageHtml.join('')}</section><section class="blocks">${blockHtml.join('')}</section></div>
</main>`;
}
