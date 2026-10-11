# @mytutor/textbook-parser

Splits a textbook PDF into units (bölmə) → topics (mövzu) → sub-headings, plus the
standard blocks (İlkin yoxlama, Məsələ və misallar, Xülasə, Ümumiləşdirici tapşırıqlar,
STEAM) and back matter. No LLM: it reads the PDF layout (heading sizes, topic badges)
and checks topic counts against the table of contents.

```bash
pnpm --filter @mytutor/textbook-parser split <book.pdf> [--out <dir>]
```

Writes `structure.json` (validated by `textbookStructureSchema` in `@mytutor/schemas`) and
`report.md` (Azerbaijani, for human review). Default output: `out/<book-name>/` (gitignored).

Calibrated on TRİMS textbooks exported from InDesign; their fonts lack ToUnicode for some
glyphs, which `src/repair.ts` decodes for headings. Titles that still look wrong are listed
as warnings in the report.

## Topic source (for knowledge extraction)

```bash
pnpm --filter @mytutor/textbook-parser source <book.pdf> --topic 4.1 [--out <dir>] [--inline]
```

Builds the **source layer** for one topic (`topicSourceSchema` in `@mytutor/schemas`), still
without any AI:

- page images (`pages/`, 2× scale, with SHA-256) and exact topic bounds (page + y);
- blocks in reading order with hierarchy: `inquiry`, `section` (Öyrənmə), `think`, `remember`,
  `exercises` → `exercise` → `example` (NÜMUNƏ), `problems`, …, each with per-page regions and
  cropped images (`crops/`);
- text lines with region, `math` flag (formula text is often incomplete — use the crop) and
  `quality`; super/subscripts are kept as `^`/`_`;
- figures (raster images and vector drawings) with crops (`figures/`) and their text labels;
- `review.html` showing the boxes on the pages next to the extracted data (`--inline` embeds
  the images so the file can be shared).

Coordinates are PDF points with a top-left origin; multiply by `imageScale` for pixels.
Template labels drawn as graphics (Öyrənmə, Fikirləş!, Məsələ həlli, …) are recognised by
the signatures in `src/template.ts`; an unknown badge becomes a `callout` block and a warning.
