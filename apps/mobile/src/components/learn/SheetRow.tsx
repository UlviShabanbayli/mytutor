import type { ReactNode } from 'react';
import { sheetRows } from '@/features/learn/hiveMotion';
import { Appear } from './Appear';

type SheetRowProps = {
  /** Its place in the sheet, from the top. */
  index: number;
  children: ReactNode;
};

/** One block of a cell's sheet, coming in 45ms after the one above it (hive.cell-tap B). */
export function SheetRow({ index, children }: SheetRowProps) {
  return (
    <Appear
      from={{ opacity: 0, y: sheetRows.rise }}
      delay={sheetRows.first + index * sheetRows.step}
      duration={sheetRows.duration}
    >
      {children}
    </Appear>
  );
}
