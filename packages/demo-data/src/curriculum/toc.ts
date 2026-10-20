/**
 * A textbook's table of contents as committed: unit and topic titles with printed page ranges
 * (copied from the local parser output; no other book text). `[number, title, start, end]`.
 */
export type TocTopic = [number: string, title: string, start: number, end: number];

export type TocUnit = {
  number: string;
  title: string;
  pages: [start: number, end: number];
  topics: TocTopic[];
};
