# 0002 — One demo world, served by the API on Node and on Cloudflare Workers

- Status: accepted, 2026-10-20
- Decided by: the product owner (Ulvi), from the demo data plan of 2026-10-20

## Decision

1. **The app's demo data is one world.** `packages/demo-data` builds it with
   `buildDemoWorld({ now, persona })`: every person, class, assignment, question, message and
   piece of progress the student, teacher and parent roles show. The eleven per-area
   `features/*/demo*.ts` files are replaced by it, one area per PR.
2. **The API serves it.** `apps/api`'s `createApp()` serves the world under `/v1/*`, one route
   per resource. The same app runs locally on Node and hosted on Cloudflare Workers.
3. **The app falls back to the same world.** `apiGet()` in `apps/mobile/src/lib/api.ts` asks
   the API; when it cannot be reached it answers from the same selectors, after a simulated
   delay, so the app works with no server at all.
4. **Book-derived content stays local.** Lesson texts written from the textbook, the book's
   answers and the published DİM questions are served only by the local Node API, from the
   gitignored content folder. They are never committed, bundled into the Worker or the app.

## Why one world

The area PRs were built in parallel, each with its own demo data, and they contradicted each
other: ids in five forms, 7B with 24 or 28 students, two join codes, a homework both graded and
waiting, the current topic 4.3 or 4.5, points that did not add up, a premium student in one
area and a free one in another, absolute October dates in one area and relative ones elsewhere.
A demo the team and testers can walk through end to end needs one truth:

- **One persona**: Nərmin Əliyeva, grade 7, class 7B, nickname `BalArısı_27`. Her teacher is
  Lalə Həsənova, her parent Səbinə Əliyeva, her brother Elvin (grade 5, waiting for consent).
  A second persona, `fresh`, is the first-day student: no classes, an empty hive, no points.
- **One clock**: every date is relative to `now`, counted in Baku time (UTC+4), so the world is
  the same on a phone in any time zone, on Node and on the Worker. The builder reads no clock
  and uses no randomness; tests pin `now`.
- **One mastery map**: 17 of the 26 topics of Riyaziyyat 7 (part 1) filled, 4.3 current. Learn,
  Me, the parent's report, Today, review, mistakes and the exam's weak spots are derived from it.
- **One set of numbers and one state per shared thing**: points 2140 / 340 / 45, a 12-day
  streak, a week of 130 minutes and 52/64 answers; `hw-4-1` handed in and waiting for Lalə's
  grade (the AI suggests 8/10); the 4.2 test open to all of 7B for four days; the live lesson
  "4.2 təkrarı" tomorrow at 18:00; the question `q-nermin-1` the same in the student's Ask and
  the teacher's inbox.
- **One schema per concept**: `packages/schemas/src/domain/` holds the shapes, `packages/types`
  infers the types. The world parses with `demoWorldSchema`, and every route's answer with its
  response schema, in tests.

The world is also the seed for PostgreSQL (F0): its ids and shapes are meant to become rows.

## The id scheme

| Thing           | Id                                                       |
| --------------- | -------------------------------------------------------- |
| Subject         | `riyaziyyat-7` (subject and grade)                       |
| Unit            | `riyaziyyat-7-u4`                                        |
| Topic           | `riyaziyyat-7-4-3` (the textbook's number with a hyphen) |
| Lesson          | the topic's id                                           |
| Topic test      | `test-riyaziyyat-7-4-3`                                  |
| Unit test       | `test-riyaziyyat-7-u4`                                   |
| Class           | `7b`, `7a`                                               |
| Assignment      | `hw-4-1`, `quiz-4-2`, `lesson-4-3`, `mock-u3`            |
| Student's photo | `q-nermin-1`                                             |
| Person          | `nermin`, `lale`, `sebine`, `elvin`, roster first names  |
| Textbook        | `trims-7` (two parts), `radius-7`, `radius-8`            |

Older forms (`r7-4-3`, `r7-4.3`, `4.3`, `demo-4.3`) are removed, not parsed.

## What is committed and what stays local

Committed (the repository is public):

- our own demo data: people, classes, progress, messages, our own short lessons, exercises and
  questions. Every source line of demo content says `demo`, and demo questions carry
  `source.demo: true`;
- the table of contents of Riyaziyyat 7 (parts 1 and 2) and Riyaziyyat 8: unit and topic titles
  and printed page numbers, which are short facts. Only part 1 of Riyaziyyat 7 is "ready"; the
  rest shows "hazırlanır".

Local only (the gitignored content folder, `CONTENT_DIR`, by default
`packages/textbook-parser/out`):

- approved lesson texts, served as `/v1/lessons/:topicId/book`;
- the book's answers, picked by the topic's printed pages, as `/v1/lessons/:topicId/answers`;
- the published DİM test questions and their figures, as `/tests/*` and `/media/*`.

Without the folder these routes are 404 (or an empty list of tests) and the app shows its demo
lesson and demo questions instead.

## How the Worker differs from the local API

|                       | Local API (`src/node.ts`)      | Worker (`src/worker.ts`)                      |
| --------------------- | ------------------------------ | --------------------------------------------- |
| Runs                  | `pnpm dev`, port 4000          | Cloudflare Workers, free plan                 |
| Demo world (`/v1/*`)  | yes                            | yes, identical JSON                           |
| Book content          | when the content folder exists | never                                         |
| Published DİM tests   | when the content folder exists | none (`/tests/subjects` is `[]`)              |
| Node APIs (`node:fs`) | yes, in `services/`            | none; checked by a test and by `check:worker` |

Both call the same `createApp()`; only the Node entry passes a content provider. The server is
stateless: the persona comes with each request (`x-demo-persona` header or `?persona=`), "now"
is the request's time, and an exam goal the student chose is sent as `?goal=`.

Writes are **shared demo events** (`packages/schemas/src/domain/demoEvents.ts`): grading a
homework, sending a message, linking a child, answering a question and so on. A screen writes
one with `useDemoWrite()` (`apps/mobile/src/lib/demoEvents.ts`); it is appended to a log kept on
the device, one log per persona (at most 200 events), and every query is refetched. When the
persona has events, `apiGet` asks `POST /v1/query { path, events }` instead of `GET path`; the API
and the offline fallback both answer with `applyDemoEvents(world, events)` applied, a pure reducer
in `packages/demo-data`. So every role on one device sees the change, and the server still
stores nothing. "Demo məlumatını sıfırla" (`resetDemo()`) clears the current persona's log;
switching persona clears the query cache.

Deploying runs `pnpm deploy:demo-api` with `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in
the repo-root `.env`, after the product owner confirms. `pnpm --filter @mytutor/api check:worker`
bundles the Worker without uploading it and fails if content-folder code is in the bundle.

## Consequences

- An area that needs data adds a selector and a route to `DEMO_ROUTES`; the API and the app's
  fallback get it at once.
- Changing a shared fact (a date, a count, a state) happens in one place, and the world tests
  say what else depends on it.
- The demo accounts (`DEMO_ACCOUNTS`: one fake phone per role, SMS code `246810`) work only in
  demo mode; Better Auth and Twilio Verify replace them.
