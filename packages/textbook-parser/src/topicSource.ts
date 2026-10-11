import type {
  BBox,
  SourceBlock,
  SourceFigure,
  SourceLine,
  SourceRegion,
  TextbookTopic,
  TopicSource,
} from '@mytutor/types';
import { ownerOf, trimRegions, type Placed, type RegionedBlock } from './assign';
import { buildBlocks, type DraftBlock, type Pos } from './blocks';
import { findFigures } from './figures';
import type { PageGraphics } from './graphics';
import { groupSourceLines } from './lines';
import { findMarkers } from './markers';
import { isSuspicious, repairBody } from './repair';
import type { TextItem, TextLine } from './types';
import { validateBlocks } from './validate';

export type TopicSourceInput = {
  topic: TextbookTopic;
  unit: { index: number; title: string };
  items: TextItem[];
  graphics: PageGraphics[];
  page: { width: number; height: number };
  body: number;
  printedPageOffset: number | null;
};

/** Everything but the rendered page images, which the CLI adds. */
export type TopicSourceDraft = Omit<
  TopicSource,
  'schemaVersion' | 'parserVersion' | 'book' | 'pages'
>;

const HEADER = 0.05; // running heads and page numbers live in these margins
const FOOTER = 0.93;
// eslint-disable-next-line no-control-regex -- raw glyph codes survive in unrepaired runs
const RAW = /[\u0000-\u001f]/;
const MATH = /[=+×·÷√²³−∙^_]|\b[a-z]\s*[²³]/;
const r1 = (n: number) => Math.round(n * 10) / 10;

export function buildTopicSource(input: TopicSourceInput): TopicSourceDraft {
  const { topic, page, body } = input;
  const H = page.height;
  const start: Pos = { page: topic.startPage, top: topic.startY ?? H * HEADER };
  const end: Pos = { page: topic.endPage, top: topic.endY ?? H * FOOTER };
  const pages = Array.from(
    { length: topic.endPage - topic.startPage + 1 },
    (_, i) => topic.startPage + i,
  );
  const window = (p: number) => ({
    top: p === start.page ? start.top : H * HEADER,
    bottom: Math.min(p === end.page ? end.top : H, H * FOOTER),
  });
  const printed = (p: number) =>
    input.printedPageOffset === null ? null : p - input.printedPageOffset;
  const lineTop = (l: TextLine) => H - l.y - l.size;
  const lineBox = (l: TextLine): BBox => ({
    x: l.x,
    y: lineTop(l),
    width: l.width,
    height: l.size * 1.25,
  });

  const items = input.items.filter((i) => {
    const w = window(i.page);
    const top = H - i.y - i.size;
    return pages.includes(i.page) && top >= w.top - 2 && top < w.bottom;
  });
  const lines = groupSourceLines(items, repairBody, body).sort(
    (a, b) => a.page - b.page || lineTop(a) - lineTop(b) || a.x - b.x,
  );
  const graphics = input.graphics.filter((g) => pages.includes(g.page));

  const markers = findMarkers({ lines, items, graphics, body, pageHeight: H });
  const title = markers.find((m) => m.kind === 'title');
  if (title) title.title = topic.title; // the badge number glyphs are not part of the title
  const drafts = buildBlocks(markers, start, end);

  // Small images in the left gutter are template icons, not figures.
  const icons = graphics.flatMap((g) =>
    g.images
      .filter((i) => i.bbox.x < 100 && i.bbox.width < 45 && i.bbox.height < 45)
      .map((i) => i.bbox),
  );
  const textBoxes = (p: number) =>
    lines.filter((l) => l.page === p && l.text.length > 3).map(lineBox);
  const figures = graphics.flatMap((g) =>
    findFigures(g, window(g.page), page, icons, textBoxes(g.page)),
  );

  // Raw regions: each span split per page across the text column; trimmed to content below.
  const rawRegions = (b: DraftBlock): SourceRegion[] =>
    b.spans.flatMap((s) =>
      pages
        .filter((p) => p >= s.from.page && p <= s.to.page)
        .flatMap((p) => {
          const w = window(p);
          const top = p === s.from.page ? s.from.top : w.top;
          const bottom = p === s.to.page ? Math.min(s.to.top, w.bottom) : w.bottom;
          if (bottom - top < 4) return [];
          return [
            {
              page: p,
              printedPage: printed(p),
              bbox: {
                x: page.width * 0.08,
                y: top,
                width: page.width * 0.84,
                height: bottom - top,
              },
            },
          ];
        }),
    );
  const ordered: RegionedBlock[] = drafts
    .map((d) => ({ d, regions: rawRegions(d) }))
    .filter((b) => b.regions.length > 0);
  const id = new Map(ordered.map((b, i) => [b.d, `b${String(i + 1).padStart(2, '0')}`]));

  const placedLines = lines.map((l, i) => {
    const placed: Placed = { page: l.page, bbox: lineBox(l) };
    return { l, i, placed, owner: ownerOf(ordered, placed)?.d };
  });
  const placedFigures = figures.map((f, i) => {
    const placed: Placed = { page: f.page, bbox: f.bbox };
    return {
      f,
      i,
      placed,
      owner: ownerOf(ordered, {
        page: f.page,
        bbox: { ...f.bbox, height: 4, y: f.bbox.y + f.bbox.height / 2 },
      })?.d,
    };
  });

  const within = (d: DraftBlock | undefined, root: DraftBlock): boolean =>
    !!d && (d === root || within(d.parent ?? undefined, root));
  const trimmed = new Map(
    ordered.map((b) => {
      const content = [...placedLines, ...placedFigures]
        .filter((x) => within(x.owner, b.d))
        .map((x) => x.placed);
      return [b.d, trimRegions(b, content)];
    }),
  );

  const sourceLines: SourceLine[] = placedLines.map(({ l, i, placed }) => ({
    id: `l${String(i + 1).padStart(3, '0')}`,
    text: l.text,
    region: { page: l.page, printedPage: printed(l.page), bbox: round(placed.bbox) },
    math: MATH.test(l.text) || (l.size > body * 1.04 && l.size < body * 1.2),
    quality: isSuspicious(l.text.replace(/[\^_]/g, '')) || RAW.test(l.text) ? 'low' : 'ok',
  }));
  const sourceFigures: SourceFigure[] = placedFigures.map(({ f, i }) => {
    const fid = `f${String(i + 1).padStart(2, '0')}`;
    const labels = placedLines
      .filter(
        ({ l, placed }) =>
          l.page === f.page &&
          l.text.length <= 14 &&
          /[\p{L}\d]/u.test(l.text) &&
          centerInside(placed.bbox, f.bbox),
      )
      .map(({ l }) => l.text);
    return {
      id: fid,
      kind: f.kind,
      region: { page: f.page, printedPage: printed(f.page), bbox: round(f.bbox) },
      labels,
      image: `figures/${fid}.png`,
    };
  });

  const blocks: SourceBlock[] = ordered.map(({ d }) => {
    const bid = id.get(d) ?? '';
    const regions = trimmed.get(d) ?? [];
    const own = placedLines
      .filter((x) => x.owner === d)
      .map((x) => sourceLines[x.i])
      .filter((l) => l !== undefined);
    const figureIds = placedFigures
      .filter((x) => x.owner === d)
      .map((x) => sourceFigures[x.i]?.id ?? '');
    return {
      id: bid,
      kind: d.kind,
      label: d.label,
      title: d.title,
      number: d.number,
      parentId: d.parent ? (id.get(d.parent) ?? null) : null,
      regions,
      crops: regions.map((_, i) => `crops/${bid}-${i + 1}.png`),
      lineIds: own.map((l) => l.id),
      figureIds,
      flags: {
        hasMath: own.some((l) => l.math),
        hasFigure: figureIds.length > 0,
        lowTextQuality: own.some((l) => l.quality === 'low'),
      },
    };
  });

  return {
    topic: {
      number: topic.number,
      title: topic.title,
      unit: input.unit,
      start: { page: start.page, y: r1(start.top) },
      end: { page: end.page, y: r1(end.top) },
    },
    blocks,
    lines: sourceLines,
    figures: sourceFigures,
    warnings: validateBlocks(blocks),
  };
}

function centerInside(a: BBox, b: BBox): boolean {
  const cx = a.x + a.width / 2;
  const cy = a.y + a.height / 2;
  return cx >= b.x && cx <= b.x + b.width && cy >= b.y && cy <= b.y + b.height;
}

function round(b: BBox): BBox {
  return { x: r1(b.x), y: r1(b.y), width: r1(b.width), height: r1(b.height) };
}
