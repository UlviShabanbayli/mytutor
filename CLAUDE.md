# CLAUDE.md

Every Claude Code session in this repo (local or cloud at claude.ai/code) MUST read
and follow this file. Communicate with the team in Azerbaijani; write code, commits,
PR titles and code comments in English.

---

## 0. Project context

A Kunduz-style education app for Azerbaijan, built by two developers who work from
separate computers and separate GitHub accounts on this one repo.

Product pillars:

1. **Ask a question** — a student photographs a question they can't solve; an AI
   produces a first-pass solution, a teacher verifies or corrects it, the student
   receives a step-by-step answer within minutes.
2. **Animated whiteboard lessons** — short video lessons where content is "hand-drawn"
   on a whiteboard in sync with Azerbaijani voice narration. Generated, not hand-made.
3. **Exam focus** — content structured around Azerbaijani school curriculum and
   DİM exams (buraxılış, qəbul).

Whiteboard lesson pipeline (planned, `apps/lesson-engine`):
topic → Claude writes a structured lesson script (JSON: scenes, narration text,
board elements, timings) → TTS in Azerbaijani (start with Azure `az-AZ` neural voices,
compare ElevenLabs) → Remotion renders React/SVG whiteboard animation synced to audio
(stroke-draw effect, hand/pen cursor, KaTeX formulas) → MP4/HLS → teacher reviews.
Note: Remotion needs a company license once the team grows; check before launch.

---

## 1. Git workflow (non-negotiable)

Branches:

- `main` — production. Only receives merges from `dev` via a release PR.
- `dev` — integration branch. All feature work merges here first.
- `feature/<name>`, `fix/<name>`, `chore/<name>` — always branched from latest `dev`.

Rules:

1. Never commit directly to `dev` or `main`.
2. Start every task from fresh `dev` on a new branch. One task = one branch = one PR.
3. Small, logical commits using Conventional Commits:
   `feat(auth): add phone OTP screen`, `fix(player): resume position`, `chore(ci): ...`
4. When the task is done, push and open a PR into `dev`. The PR description must contain
   (in Azerbaijani): what changed, why, how to test, screenshots/recordings for UI changes.
5. NEVER merge without human approval. Merge only after a team member says it is
   approved AND GitHub shows the review as approved
   (`gh pr view <n> --json reviewDecision` → `APPROVED` when `gh` is available).
   Merge with squash and delete the branch.
6. Open a `dev → main` release PR only when a human explicitly asks for a release.
7. Before opening any PR, `pnpm typecheck && pnpm lint && pnpm test` must pass.
   If something cannot pass, say so in the PR description instead of hiding it.

Setup (done by humans, for reference): private GitHub repo, both developers as
collaborators, Claude GitHub App installed on this repo only, branch protection on
`main` and `dev` (PR required, 1 approving review, CI must pass). Work runs mainly
through Claude Code on the web; cloud environment setup script:
`npm install -g pnpm && pnpm install`.

---

## 2. Stack

Monorepo: pnpm workspaces + Turborepo. `pnpm-workspace.yaml` sets `nodeLinker: hoisted` for Expo.

Mobile (`apps/mobile`):

- Expo (latest stable SDK), Expo Router with typed routes
- TypeScript strict (`strict`, `noUncheckedIndexedAccess`)
- NativeWind (Tailwind for React Native); no inline style objects except animated values
- `expo-video` for all playback (HLS, fullscreen, PiP, resume position)
- TanStack Query (server state), Zustand (client/UI state)
- react-hook-form + Zod for forms
- Reanimated + Gesture Handler for motion; FlashList for long lists

API (`apps/api`):

- Node + TypeScript, Hono
- PostgreSQL + Drizzle ORM. No flat JSON storage in this project; it must scale.

Authentication and verification are SEPARATE concerns and SEPARATE libraries:

- **Authentication** (sign-in, sessions, tokens, sign-out): Better Auth + its Expo client.
- **Verification** (proving phone ownership via SMS OTP): Twilio Verify, called only from
  the API, never from the app. Hidden behind a `VerificationService` interface so it can
  be swapped for a local Azerbaijani SMS gateway without touching callers.
- **Input validation**: Zod schemas in `packages/schemas`, shared by app and API.

Before adding any new library, check its current docs and latest stable version;
do not rely on memory for API details.

---

## 3. Folder structure

```
apps/
  mobile/
    app/                      # Expo Router routes ONLY (thin screens)
      (auth)/                 # phone, otp
      (tabs)/                 # home, tests, results, profile
      subject/[id].tsx        # topics of a subject
      test/[id]/              # test session (index) and result
      _layout.tsx
    src/
      components/
        ui/                   # primitives: Button, Text, Input, Card, Sheet, ...
        video/                # VideoPlayer, PlayerControls, ProgressBar
        <feature>/            # composed, feature-specific components
      features/<feature>/     # hooks, API calls, state for one feature
      lib/                    # api client, auth client, query client
      theme/                  # design tokens
      i18n/                   # az only for now (keys kept so locales can be added)
  api/
    src/ routes/ services/ db/ middleware/
  admin/                      # web content panel (Vite + React, same tokens): textbook → source → knowledge review
    server/                   # dev-only plugin: `/content/` serves pipeline outputs, `/content-api/` runs actions (add book, extract source)
    src/ routes/ components/ features/ i18n/ lib/
  lesson-engine/              # later: Remotion whiteboard pipeline
packages/
  types/                      # shared domain types (User, Lesson, Question, Answer, ...)
  schemas/                    # shared Zod schemas; derive types with z.infer
  config/                     # shared tsconfig, eslint, tailwind preset
```

---

## 4. Code rules

- Screens in `app/` are thin: compose components, call feature hooks. No business logic.
- One component per file, PascalCase filename, named export, ~150 lines max; split if larger.
- Props types live next to their component (`type ButtonProps = { ... }`).
- Domain types exist ONLY in `packages/types` or are inferred from `packages/schemas`.
  Never redeclare a domain type locally.
- No `any`; use `unknown` and narrow. No non-null `!` without a comment saying why.
- No hard-coded colors, sizes or user-facing strings: use theme tokens and i18n keys.
- Components never call `fetch` directly; all API access goes through feature hooks
  (`useLessons`, `useAskQuestion`, ...).
- Every screen handles loading, empty and error states.
- Name things precisely and consistently; follow existing names before inventing new ones.

---

## 5. UI / UX

- Apply the `ui-ux-pro-max` skill to every UI task; use the 21st MCP for component
  inspiration when available.
- Modern, clean, calm interface for students; touch targets ≥ 44pt; dark mode from day one.
- Accessibility: labels on interactive elements, sufficient contrast, respect dynamic type.
- Build primitives in `components/ui` first, then compose features from them.

---

## 6. MVP roadmap (do in order, one PR each unless told otherwise)

Demo scope: **test practice**. The app UI is Azerbaijani only.

Content rule (non-negotiable): test questions are built ONLY from the textbooks and
test banks the team provides. Paraphrase them; never invent questions, answers or
explanations. Every question cites its source (`sourceRefSchema`: book/bank, grade,
section, page) so a teacher can verify it.

1. **Scaffold** — monorepo, `apps/mobile`, `apps/api` skeleton, `packages/*`, GitHub
   Actions CI (typecheck, lint, test), theme tokens, `components/ui` primitives.
2. **Test UI** — subjects → topics → one-question-at-a-time test with feedback,
   explanation and source → result → results history. Runs on clearly marked demo data.
3. **Content import** — ingest the provided textbooks and test banks into
   paraphrased, source-cited questions (schemas in `packages/schemas/src/test.ts`).
4. **Tests API** — serve subjects/topics/tests from PostgreSQL; persist results.

After the demo:

5. **Auth** — phone number → OTP verification → session.
6. **Ask a question** — camera/photo upload → status tracking → answer view.
7. **Teacher panel** (web).
8. **Lessons** — list, detail, `VideoPlayer` with resume position.
9. **Lesson engine** — Remotion whiteboard pipeline.

Current status: Scaffold PR and Test UI PR open.
Next task: roadmap item 3 (Content import) once the team sends textbooks and test banks.
