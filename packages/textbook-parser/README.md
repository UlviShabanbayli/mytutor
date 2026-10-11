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
