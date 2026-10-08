import { describe, expect, it } from 'vitest';
import type { SourceBlock, TopicSource } from '@mytutor/types';
import { blockOverlays, flattenBlockTree } from './blocks';

const block = (
  id: string,
  kind: SourceBlock['kind'],
  parentId: string | null,
  page = 85,
): SourceBlock => ({
  id,
  kind,
  label: null,
  title: null,
  number: null,
  parentId,
  regions: [{ page, printedPage: page - 2, bbox: { x: 0, y: 0, width: 10, height: 10 } }],
  crops: [],
  lineIds: [],
  figureIds: [],
  flags: { hasMath: false, hasFigure: false, lowTextQuality: false },
});

describe('flattenBlockTree', () => {
  it('puts children right after their parent with depth', () => {
    const blocks = [
      block('b1', 'section', null),
      block('b2', 'exercises', null),
      block('b3', 'exercise', 'b2'),
      block('b4', 'example', 'b3'),
      block('b5', 'think', null),
    ];
    expect(flattenBlockTree(blocks).map((n) => `${n.block.id}:${n.depth}`)).toEqual([
      'b1:0',
      'b2:0',
      'b3:1',
      'b4:2',
      'b5:0',
    ]);
  });

  it('keeps blocks whose parent is missing at the top level', () => {
    expect(flattenBlockTree([block('b1', 'exercise', 'gone')])).toHaveLength(1);
  });
});

describe('blockOverlays', () => {
  it('returns regions on the page with containers first', () => {
    const source = {
      blocks: [
        block('b1', 'exercise', 'b2'),
        block('b2', 'exercises', null),
        block('b3', 'section', null, 86),
      ],
    } as TopicSource;
    expect(blockOverlays(source, 85).map((o) => [o.id, o.container, o.category])).toEqual([
      ['b2', true, 'task'],
      ['b1', false, 'task'],
    ]);
  });
});
