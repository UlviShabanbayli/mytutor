import type {
  BBox,
  SourceBlock,
  SourceFigure,
  SourceLine,
  SourceRegion,
  TextbookTopic,
  TopicSource,
} from '@mytutor/types';
import { centerInside, ownerOf, trimRegions, type Placed, type RegionedBlock } from './assign';
import { buildBlocks, withSideBoxes, type DraftBlock, type Pos } from './blocks';
import { findFigures } from './figures';
import type { PageGraphics } from './graphics';
import { groupSourceLines } from './lines';
import { findLayoutMarkers } from './layoutMarkers';
import { findMarkers, type Marker } from './markers';
import { isSuspicious, repairBody } from './repair';
import { findPanels, findSideBoxes, sideBoxAt, type SideBox } from './template';
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
// The topic start is the heading's detected top; glyph tops can sit a point or two above it.
const SLACK = 3;

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

  const graphics = input.graphics.filter((g) => pages.includes(g.page));
  // Side boxes (e.g. "Açar sözlər") stand beside the text column, so full-width spans cannot
  // hold them: they become blocks of their own, cut out by their panel.
  const boxes: SideBox[] = graphics.flatMap((g) =>
    findSideBoxes(g, page.width).filter((x) => {
      const w = window(x.page);
      const middle = x.bbox.y + x.bbox.height / 2;
      return middle >= w.top - SLACK && middle < w.bottom;
    }),
  );
  const panels = graphics.flatMap((g) =>
    findPanels(g, page.width).map((bbox) => ({ page: g.page, bbox })),
  );
  const boxAt = (p: number, b: BBox) => sideBoxAt(boxes, p, b);
  const itemBox = (i: TextItem): BBox => ({
    x: i.x,
    y: H - i.y - i.size,
    width: i.width,
    height: i.size,
  });

  const items = input.items.filter((i) => {
    const w = window(i.page);
    const top = H - i.y - i.size;
    return pages.includes(i.page) && top >= w.top - SLACK && top < w.bottom;
  });
  // A box's text is grouped on its own, so no line runs across the panel edge.
  const groupLines = () =>
    [undefined, ...boxes]
      .flatMap((x) =>
        groupSourceLines(
          items.filter((i) => boxAt(i.page, itemBox(i)) === x),
          repairBody,
          body,
        ),
      )
      .sort((a, b) => a.page - b.page || lineTop(a) - lineTop(b) || a.x - b.x);
  let lines = groupLines();

  const columnLines = lines.filter((l) => !boxAt(l.page, lineBox(l)));
  const template = findMarkers({
    lines: columnLines,
    items,
    graphics,
    body,
    pageHeight: H,
    panels,
  });
  // A book outside the TRİMS template shows few of its labels, badges or number circles (a
  // "Teorem 1." may match): its blocks are found by label vocabulary and layout instead, when
  // that finds clearly more of them.
  const specific = (ms: Marker[]) => ms.filter((m) => m.kind !== 'title' && m.kind !== 'section');
  const layout = findLayoutMarkers({
    lines: columnLines,
    items,
    body,
    pageHeight: H,
    topicTitle: topic.title,
    graphics,
  });
  const found = specific(layout).length > 2 * specific(template).length ? layout : template;
  // A label printed in a narrow panel (a NÜMUNƏ beside the text) makes the panel a side box.
  for (const m of found) {
    if (m.box && !boxAt(m.page, m.box)) {
      const { kind, label, number, page: p, box: bbox } = m;
      boxes.push({ kind, label, number, page: p, bbox, parts: [bbox], frame: false });
    }
  }
  if (found.some((m) => m.box)) lines = groupLines();
  // A topic has one title, its heading; other large glyphs (e.g. a big "a/b" in a drawing) are content.
  const markers = found
    .filter((m) => !m.box)
    .filter((m, i, all) => m.kind !== 'title' || all.findIndex((x) => x.kind === 'title') === i);
  const title = markers.find((m) => m.kind === 'title');
  if (title) title.title = topic.title; // the badge number glyphs are not part of the title
  const drafts = withSideBoxes(
    buildBlocks(markers, { ...start, top: start.top - SLACK }, end),
    boxes,
  );

  // Small images in the left gutter are template icons, not figures.
  const icons = graphics.flatMap((g) =>
    g.images
      .filter((i) => i.bbox.x < 100 && i.bbox.width < 45 && i.bbox.height < 45)
      .map((i) => i.bbox),
  );
  const textBoxes = (p: number) =>
    lines.filter((l) => l.page === p && l.text.length > 3).map(lineBox);
  // A template box's panel, pill and icon are its frame, not a drawing.
  const framed = (p: number, b: BBox) => boxAt(p, b)?.frame === true;
  const outsideBoxes = (g: PageGraphics): PageGraphics => ({
    ...g,
    images: g.images.filter((i) => !framed(g.page, i.bbox)),
    paths: g.paths.filter((q) => !framed(g.page, q.bbox)),
  });
  const figures = graphics.flatMap((g) =>
    findFigures(outsideBoxes(g), window(g.page), page, icons, textBoxes(g.page)),
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
    .map((d) => ({
      d,
      regions: d.box
        ? [{ page: d.box.page, printedPage: printed(d.box.page), bbox: round(d.box.bbox) }]
        : rawRegions(d),
    }))
    .filter((b) => b.regions.length > 0);
  const id = new Map(ordered.map((b, i) => [b.d, `b${String(i + 1).padStart(2, '0')}`]));

  // A side box owns what lies inside its panel; everything else goes by the full-width spans.
  const column = ordered.filter((b) => !b.d.box);
  const owner = (p: Placed) => {
    const box = boxAt(p.page, p.bbox);
    return box ? drafts.find((d) => d.box === box) : ownerOf(column, p)?.d;
  };
  const placedLines = lines.map((l, i) => {
    const placed: Placed = { page: l.page, bbox: lineBox(l) };
    return { l, i, placed, owner: owner(placed) };
  });
  const placedFigures = figures.map((f, i) => {
    const placed: Placed = { page: f.page, bbox: f.bbox };
    return {
      f,
      i,
      placed,
      owner: owner({
        page: f.page,
        bbox: { ...f.bbox, height: 4, y: f.bbox.y + f.bbox.height / 2 },
      }),
    };
  });

  const within = (d: DraftBlock | undefined, root: DraftBlock): boolean =>
    !!d && (d === root || within(d.parent ?? undefined, root));
  const trimmed = new Map(
    ordered.map((b) => {
      const content = [...placedLines, ...placedFigures]
        .filter((x) => within(x.owner, b.d))
        .map((x) => x.placed);
      return [b.d, b.d.box ? b.regions : trimRegions(b, content)];
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

function round(b: BBox): BBox {
  return { x: r1(b.x), y: r1(b.y), width: r1(b.width), height: r1(b.height) };
}
