# 0003 — Knowledge review in three tiers, and a grade check for LaTeX

- Status: accepted, 2026-10-21
- Decided by: the product owner (Ulvi), from the team's digitization research paper
  ("PDF Digitization Architecture Strategy") and its review of 2026-10-21

## Decision

1. **Every knowledge item has a review tier** (`reviewTier` in `packages/schemas/src/review.ts`):
   - `auto`: status `textbook` and every check passed. These are approved together with the
     block's "approve the confirmed items" button.
   - `targeted`: status `derived` and every check passed. The model structured the textbook in
     its own words; an editor compares each one with the block's crop and decides it alone.
   - `full`: status `unverified`, or any check failed (the same items as `isFlagged`). An editor
     reads them in full.
2. **A new check, `grade_symbols`, flags LaTeX from later grades.** A command first taught in a
   later grade (`\sqrt`, trigonometry and `\infty` from grade 8, vectors and `\sum` from 9,
   logarithms from 10, `\lim` and `\int` from 11), or one no school book uses (`\aleph`,
   `\partial`, …), fails the check. It only flags: the status does not change. The first grades
   were counted in our Riyaziyyat 7–11 textbooks; sets and π already appear in grade 7, and we
   have no book below grade 7, so nothing earlier is listed.
3. **The grade comes from the knowledge CLI** (`--grade=N`). Without it the check is skipped.
   Existing documents get the check by rebuilding from the AI cache, which makes no API call.

## Why

The paper proposes confidence-gated review: auto-approve the confident extractions, review the
moderate ones where they are flagged, audit the rest. Our checks and statuses already give that
signal. Measured on grade 7 part 1 (1497 items): 1158 auto (77%), 256 targeted (17%), 83 full
(6%). Before this change the bulk button approved every item that was not flagged, derived
ones included, and on 2026-10-14 all 1497 items were approved in bulk. The 83 flagged items
were reopened for review on 2026-10-21; their earlier decisions are kept in a backup outside
the repo.

## Not adopted from the paper

- OCR engines and 300 DPI preprocessing: our textbooks have a text layer, decoded by
  `textbook-parser`; only test books are scans, and Claude reads those.
- IDs derived from page and position (`q_tb_dim_2024_p112_q14`): ADR 0001 keeps IDs generated
  once, so a new edition cannot move them.
- Automatic LaTeX correction by edit distance: test questions are used as printed, and a
  correction is an editor's decision.
- Bounding boxes from the model: the model returns block and band IDs, and code resolves
  positions.
- Figures on a public CDN: book content is copyrighted and stays private.
