# 0001 — Storage and content model for the MVP

- Status: accepted, 2026-10-11
- Decided by: the product owner (Ulvi), from the reviewed architecture plan

## Decision

1. **PostgreSQL is the target architecture.** Content, versions, links and student progress
   end up in PostgreSQL (Drizzle ORM), with PDFs, page images, crops and other media in object
   storage. This is not optional.
2. **File-based content is a temporary MVP choice.** Until the move, content authoring keeps
   running on files: the admin panel's dev plugin over `packages/textbook-parser/out/`
   (structure, sources, knowledge, reviews, curricula, links).
3. **Student topic status lives on the device for the MVP**, in a versioned format, with no
   synchronisation.

New content data is shaped so that moving it to PostgreSQL is a mechanical import (see
"Rules for new data").

## Why PostgreSQL is the target

- `CLAUDE.md` (first version, 2026-10-08): "PostgreSQL + Drizzle ORM. No flat JSON storage in
  this project; it must scale."
- The engine brief of 2026-10-10 asks for relational columns for entities, statuses and links
  (JSONB only for truly variable structures) and object storage for large files. It lists what
  is stored there: knowledge documents and their immutable versions, lessons and lesson
  versions, questions and question versions, links between content and sources, validation
  reports and review events, media metadata, and later student attempts and topic progress.
- `out/` is gitignored, so the second developer has none of the content. Two people working on
  the same content, and the app reading it, need a shared server store.

## Why files for now

- The pipeline that works today runs on files: textbook parser, knowledge engine, block-by-block
  review, curricula and links. It is covered by tests.
- Where the database is hosted is still open. `apps/api` serves only `/health`, its schema is
  empty, and sign-in does not exist yet.
- Moving storage first would delay the curriculum, lesson and test work without changing what
  editors can do.

## Rules for new data

1. **Stable IDs, never derived from order.** Prefixed and generated once: `cur_` (curriculum),
   `topic_`, `lesson_`, `scv_` (scenario version), `std_` (standard set), `tb_` (test book), `q_`
   (question). Display numbers such as `1.1` are attributes, not identifiers.
2. **One file per aggregate, with `schemaVersion`.** Relations are explicit lists of link records
   with their own fields (status, role, confidence); each record becomes a table row later.
3. **Validated and atomic.** Every file is read and written through a Zod schema in
   `packages/schemas`, and written through a temporary file and a rename.
4. **The textbook source layer stays as it is.** Structure, sources, knowledge and reviews keep
   being addressed by book, topic number and item (id plus fingerprint). Curriculum objects
   refer to this layer; they never copy or rename it.
5. **Additive changes only.** New fields are optional for old files, nothing is rewritten in
   place by a migration, and replaced data is kept (versions, trash).

## Rules agreed for the next phases

- **Topic merges keep history.** Merging topic B into A keeps B's record with `mergedInto: A` and
  a merge record (when, by whom, which topics). Anything that pointed to B (lessons, standard
  mappings, question links) resolves through that redirect and is rewritten to A when next
  saved, never dropped. The merge record allows undoing it.
- **Re-processing a textbook changes nothing silently.** Approved curriculum topics and approved
  scenarios stay as they are; differences in the new source are flagged for review.
- **Scenario versions.** Generating a scenario, or regenerating one scene, creates a new draft
  version; a regenerated scene's sources are checked again. A lesson's active version (what
  students see) changes only when a whole new version is approved. Until then the previously
  approved version stays active. Approved versions are never edited.
- **Only approved knowledge feeds lessons.** Items with the decision "approved" are used;
  "needs fix", "rejected" and undecided items are not. Book, page and block references travel
  with every item.
- **Question–topic links have a role.** `required` means the topic is needed to solve the
  question; `related` is context only. Each link also has a status (suggested, confirmed,
  rejected) and an optional confidence. The student filter shows a question only when:
  - its answer is known;
  - it has at least one `required` link and every `required` link is confirmed;
  - on every `required` topic the student is `lesson_completed`, `self_reported` or
    `mastered`.

  `related` links never hide a question. `not_started` never unlocks one. A question with an
  unconfirmed `required` link stays out of regular practice and goes to review.

- **Student status values stay distinct:** `not_started`, `lesson_completed`, `self_reported`
  (the student says they know it, alone or in bulk) and `mastered` (shown by an assessment).
  Device format: `{ schemaVersion: 1, topics: { [topicId]: { status, updatedAt } } }`, with a
  migration step per version.
- **Curriculum coverage of official standards (ARTİ) is monitoring only.** A sub-standard is
  _covered_ when a confirmed mapping links it to a topic with at least one approved knowledge
  item, _uncertain_ when a mapping exists without that evidence or is not confirmed, and
  _uncovered_ otherwise. Coverage is covered divided by applicable sub-standards. Without a
  standard set the curriculum shows "no data", not 0%. Coverage never blocks any other step.

## Moving to PostgreSQL

- File kinds map to tables: curricula, curriculum textbooks, topics, topic sources, topic merges;
  lessons, scenario versions, scenes; standard sets, standards, topic–standard mappings; test
  books, questions, question–topic links; student topic progress. IDs are carried over as they
  are.
- The move is a one-off importer that reads the files through the same Zod schemas.
- It is due when the database hosting is decided and the second developer needs the shared
  content, or when the app has to serve real lessons and questions, whichever comes first.

## Rollback

Each phase is a separate pull request. Because files are only extended, never rewritten in
place, reverting a phase leaves the data readable by the previous version.
