import type { BBox, SourceBlockKind } from '@mytutor/types';
import { centerInside } from './assign';
import type { PageGraphics } from './graphics';
import { findGraphicMarkers, findNumberCircles, TEXT_LABELS } from './template';
import type { TextItem, TextLine } from './types';
import { numberText } from './repair';

/** Something that opens a block: a label, badge, icon, heading or exercise number. */
export type Marker = {
  kind: SourceBlockKind;
  page: number;
  /** Top edge, points from the top of the page. */
  top: number;
  label: string | null;
  title: string | null;
  number: string | null;
  /** Set when the label is printed inside a narrow panel: the panel is the whole block. */
  box?: BBox;
};

type Input = {
  lines: TextLine[];
  items: TextItem[];
  graphics: PageGraphics[];
  body: number;
  pageHeight: number;
  /** Narrow panels (side notes, drawing backgrounds) per page. */
  panels?: { page: number; bbox: BBox }[];
};

const SECTION = 1.25; // 16pt sub-headings over 12pt body
const TITLE = 1.6;
const COLUMN_HEADERS = /^(Həlli|Açıqlama)$/;

const topOf = (line: TextLine, pageHeight: number) => pageHeight - line.y - line.size;

/** Only the label itself ("NÜMUNƏ 1.") is the marker; what follows on the line is content. */
function labelMarker(
  label: (typeof TEXT_LABELS)[number],
  text: string,
  at: { page: number; top: number },
): Marker {
  const number = label.pattern.exec(text)?.[1] ?? null;
  const printed = number ? `${label.label} ${number}.` : label.label;
  return { kind: label.kind, ...at, label: printed, title: null, number };
}

/** Finds every block-opening marker in the topic window, in reading order. */
export function findMarkers({
  lines,
  items,
  graphics,
  body,
  pageHeight,
  panels = [],
}: Input): Marker[] {
  const markers: Marker[] = [];
  const at = (line: TextLine) => ({ page: line.page, top: topOf(line, pageHeight) });

  for (const line of lines) {
    const text = line.text.trim();
    const label = TEXT_LABELS.find((l) => l.pattern.test(text));
    const box = { x: line.x, y: at(line).top, width: line.width, height: line.size * 1.25 };
    const panel = panels.find((p) => p.page === line.page && centerInside(box, p.bbox));
    if (panel) {
      // Text in a narrow panel never opens a full-width block: big glyphs there are drawings or
      // ticks, and a printed label (a side NÜMUNƏ) makes the panel a block of its own.
      if (label) markers.push({ ...labelMarker(label, text, at(line)), box: panel.bbox });
      continue;
    }
    if (line.size >= body * TITLE) {
      markers.push({ kind: 'title', ...at(line), label: null, title: text, number: null });
      continue;
    }
    if (label) {
      markers.push(labelMarker(label, text, at(line)));
    } else if (line.size >= body * SECTION && !COLUMN_HEADERS.test(text)) {
      markers.push({ kind: 'section', ...at(line), label: null, title: text, number: null });
    }
  }

  for (const g of graphics) {
    for (const gm of findGraphicMarkers(g)) {
      // The "Öyrənmə" badge sits on the same line as its section heading: label that heading.
      if (gm.kind === 'section') {
        const heading = markers.find(
          (m) => m.kind === 'section' && m.page === gm.page && Math.abs(m.top - gm.y) < 14,
        );
        if (heading) {
          heading.label = gm.label;
          continue;
        }
      }
      const duplicate = markers.some(
        (m) => m.kind === gm.kind && m.page === gm.page && Math.abs(m.top - gm.y) < 30,
      );
      if (!duplicate)
        markers.push({
          kind: gm.kind,
          page: gm.page,
          top: gm.y,
          label: gm.label,
          title: null,
          number: null,
        });
    }
    for (const circle of findNumberCircles(g)) {
      const inside = items.filter((i) => {
        const top = pageHeight - i.y - i.size;
        return (
          i.page === g.page &&
          i.x >= circle.bbox.x - 2 &&
          i.x <= circle.bbox.x + circle.bbox.width &&
          top >= circle.bbox.y - 4 &&
          top <= circle.bbox.y + circle.bbox.height
        );
      });
      // Some badges are overprinted ("1" then "2" at the same spot): the glyph drawn last is the
      // one on top, so keep the last item per position and read the positions left to right.
      const byX = new Map<number, TextItem>();
      for (const i of inside) byX.set(Math.round(i.x * 2) / 2, i);
      const number = [...byX.entries()]
        .sort(([a], [b]) => a - b)
        .map(([, i]) => numberText(i))
        .join('')
        .trim();
      if (/^\d{1,3}$/.test(number)) {
        markers.push({
          kind: 'exercise',
          page: g.page,
          top: circle.bbox.y,
          label: null,
          title: null,
          number,
        });
      }
    }
  }

  return markers.sort((a, b) => a.page - b.page || a.top - b.top);
}
