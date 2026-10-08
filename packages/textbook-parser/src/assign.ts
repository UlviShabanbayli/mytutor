import type { BBox, SourceRegion } from '@mytutor/types';
import type { DraftBlock } from './blocks';

export type Placed = { page: number; bbox: BBox };
export type RegionedBlock = { d: DraftBlock; regions: SourceRegion[] };

const startOf = (b: RegionedBlock) => ({
  page: b.regions[0]?.page ?? 0,
  top: b.regions[0]?.bbox.y ?? 0,
});
const isAncestor = (a: DraftBlock, b: DraftBlock): boolean =>
  b.parent ? b.parent === a || isAncestor(a, b.parent) : false;

/**
 * The block an element belongs to: among blocks whose region contains its top, the one that
 * opened most recently (so a line right after "2" belongs to exercise 2, not the NÜMUNƏ of
 * exercise 1 whose padded region still reaches it).
 */
export function ownerOf(blocks: RegionedBlock[], el: Placed): RegionedBlock | undefined {
  const y = el.bbox.y + Math.min(2, el.bbox.height / 2);
  return blocks
    .filter((b) =>
      b.regions.some((r) => r.page === el.page && y >= r.bbox.y && y < r.bbox.y + r.bbox.height),
    )
    .sort((a, b) => {
      const sa = startOf(a);
      const sb = startOf(b);
      return sb.page - sa.page || sb.top - sa.top || (isAncestor(a.d, b.d) ? 1 : -1);
    })[0];
}

const union = (boxes: BBox[]): BBox | null => {
  if (boxes.length === 0) return null;
  const x = Math.min(...boxes.map((b) => b.x));
  const y = Math.min(...boxes.map((b) => b.y));
  return {
    x,
    y,
    width: Math.max(...boxes.map((b) => b.x + b.width)) - x,
    height: Math.max(...boxes.map((b) => b.y + b.height)) - y,
  };
};

/**
 * Shrinks each region to what the block (and its children) actually contain, keeping the
 * marker's top on the first region, and drops page regions with nothing in them.
 */
export function trimRegions(block: RegionedBlock, content: Placed[], padding = 4): SourceRegion[] {
  return block.regions.flatMap((r, i) => {
    const inside = content.filter(
      (c) => c.page === r.page && c.bbox.y >= r.bbox.y - 1 && c.bbox.y < r.bbox.y + r.bbox.height,
    );
    const box = union(inside.map((c) => c.bbox));
    if (!box) return i === 0 && block.regions.length === 1 ? [r] : [];
    const top = i === 0 ? Math.min(r.bbox.y, box.y) : box.y;
    const bottom = Math.min(r.bbox.y + r.bbox.height, box.y + box.height);
    const left = Math.min(r.bbox.x, box.x);
    const right = Math.max(r.bbox.x + r.bbox.width, box.x + box.width);
    const round = (n: number) => Math.round(n * 10) / 10;
    return [
      {
        ...r,
        bbox: {
          x: round(left - padding / 2),
          y: round(top - padding / 2),
          width: round(right - left + padding),
          height: round(bottom - top + padding),
        },
      },
    ];
  });
}
