export type CombRow<T> = { items: T[]; offset: boolean };

/**
 * Lays cells out as a honeycomb: rows of `perRow`, every second row shifted by half a cell
 * (the screen draws the shift and the overlap; this only decides the rows).
 */
export function combRows<T>(items: T[], perRow = 3): CombRow<T>[] {
  const rows: CombRow<T>[] = [];
  for (let i = 0; i < items.length; i += perRow) {
    rows.push({ items: items.slice(i, i + perRow), offset: rows.length % 2 === 1 });
  }
  return rows;
}

/** Shift and overlap of the comb's offset rows for a cell size (design: gap 6, 4pt seam). */
export function combGeometry(cellWidth: number, cellHeight: number, gap: number) {
  return {
    width: cellWidth * 3 + gap * 2 + (cellWidth + gap) / 2,
    rowShift: (cellWidth + gap) / 2,
    rowOverlap: cellHeight / 4 - 4,
  };
}
