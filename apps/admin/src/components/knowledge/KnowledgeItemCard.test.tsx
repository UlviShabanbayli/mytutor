import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { KnowledgeItem, TopicSource } from '@mytutor/types';
import '@/i18n';
import { KnowledgeItemCard } from './KnowledgeItemCard';

const region = (y: number) => ({
  page: 24,
  printedPage: 22,
  bbox: { x: 71, y, width: 300, height: 15 },
});
const source: TopicSource = {
  schemaVersion: 1,
  parserVersion: '0.2.0',
  book: { file: 'b.pdf', sha256: 'abc', pageCount: 144, printedPageOffset: 2 },
  topic: {
    number: '1.4',
    title: 'Rasional ədədlərin toplanması',
    unit: { index: 1, title: 'Rasional ədədlər' },
    start: { page: 24, y: 68 },
    end: { page: 27, y: 800 },
  },
  pages: [],
  blocks: [
    {
      id: 'b02',
      kind: 'inquiry',
      label: 'Araşdırma-müzakirə',
      title: null,
      number: null,
      parentId: null,
      regions: [region(110)],
      crops: ['crops/b02-1.png'],
      lineIds: ['l005'],
      figureIds: ['f01'],
      flags: { hasMath: false, hasFigure: true, lowTextQuality: false },
    },
  ],
  lines: [],
  figures: [
    {
      id: 'f01',
      kind: 'image',
      region: { page: 24, printedPage: 22, bbox: { x: 426, y: 105, width: 156, height: 135 } },
      labels: [],
      image: 'figures/f01.png',
    },
  ],
  warnings: [],
};
const item: KnowledgeItem = {
  id: 'k001',
  type: 'question',
  status: 'textbook',
  claimedOrigin: 'textbook',
  readFrom: 'image',
  sources: [
    {
      blockId: 'b02',
      lineIds: ['l005'],
      figureId: null,
      regions: [region(142)],
      crops: ['crops/b02-1.png'],
    },
    {
      blockId: 'b02',
      lineIds: [],
      figureId: 'f01',
      regions: [source.figures[0]?.region ?? region(105)],
      crops: ['crops/b02-1.png', 'figures/f01.png'],
    },
  ],
  content: {
    text: 'Tilov və qarmaqlara uyğun nöqtələrin koordinatları şəkildə verilib.',
    latex: null,
  },
  checks: [
    { name: 'source_ids', result: 'pass', detail: null },
    { name: 'figure_link', result: 'pass', detail: 'qayda ilə bağlandı ("şəkildə"): f01' },
  ],
};
const render = (it: KnowledgeItem) =>
  renderToStaticMarkup(
    <KnowledgeItemCard
      item={it}
      source={source}
      topicDir="book/topics/1.4"
      active={false}
      onSelect={() => undefined}
    />,
  );

describe('KnowledgeItemCard', () => {
  it('shows the figure the text relies on next to the text', () => {
    const html = render(item);
    expect(html).toContain('koordinatları şəkildə verilib');
    expect(html).toContain('<img src="/content/book/topics/1.4/figures/f01.png" alt="Fiqur f01"');
    // The new check is listed under its Azerbaijani name.
    expect(html).toMatch(/>Fiqur<\/span><span[^>]*> — qayda ilə bağlandı/);
  });

  it('renders an older item without figures or the figure check', () => {
    const older: KnowledgeItem = {
      ...item,
      sources: item.sources.slice(0, 1),
      checks: item.checks.slice(0, 1),
    };
    const html = render(older);
    expect(html).toContain('koordinatları şəkildə verilib');
    expect(html).not.toContain('<img');
  });
});
