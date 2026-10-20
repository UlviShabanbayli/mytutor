# MyTutor

Kunduz-style education app for Azerbaijan. Demo scope: test practice built from
provided textbooks and test banks. See [CLAUDE.md](CLAUDE.md) for product context, git workflow and code rules.

## Requirements

- Node 24 (`.nvmrc`)
- pnpm 12 (`npm install -g pnpm`)
- Expo Go on the phone, for the SDK in `apps/mobile/package.json`

## Run locally

```bash
git pull
pnpm install
pnpm dev
```

`pnpm dev` starts two tasks in Turborepo's terminal UI:

- **the API** on http://localhost:4000. It serves the demo world (see
  [ADR 0002](docs/decisions/0002-demo-world.md)). If the gitignored content folder exists, it
  also serves the published tests and the book-derived lesson content; without it, the app
  shows its demo lessons and questions.
- **the Expo dev server**. Select the `@mytutor/mobile#dev` task (arrow keys) to see its QR code;
  press `i` to type into it (`w` opens the web build, `r` reloads), `Ctrl+Z` to leave it. If
  the QR code does not show there, run `pnpm --filter @mytutor/mobile dev` in a second terminal
  instead.

On the phone:

1. Put the phone on the **same Wi-Fi** as the computer.
2. Scan the QR code with Expo Go (Android) or the Camera app (iPhone).
3. On a phone, "localhost" is the phone itself. Point the app at the computer: create
   `apps/mobile/.env` with the computer's address on the network, then restart `pnpm dev`:

   ```bash
   EXPO_PUBLIC_API_URL=http://192.168.0.190:4000   # your computer's IP (macOS: ipconfig getifaddr en0)
   ```

   Or point it at the hosted demo API (Cloudflare Workers, demo world only) and the phone works
   without the computer's API:

   ```bash
   EXPO_PUBLIC_API_URL=https://ari-demo-api.<account>.workers.dev
   ```

If the app cannot reach any API within 2.5 seconds, it answers from the same demo world built
into the app, so every screen still works offline.

### Demo accounts

Sign-in is by phone and SMS code. In demo mode no SMS is sent: every demo phone accepts the
code **246810**. The numbers are fake and work in the demo only.

| Phone         | Role    | Persona (`x-demo-persona`) | Who                                         |
| ------------- | ------- | -------------------------- | ------------------------------------------- |
| 050 000 00 01 | student | `nermin`                   | Nərmin Əliyeva, 7B, the full demo           |
| 050 000 00 02 | student | `fresh`                    | Yeni şagird: first day, nothing yet         |
| 050 000 00 03 | teacher | `nermin`                   | Lalə Həsənova, 7B and 7A                    |
| 050 000 00 04 | parent  | `nermin`                   | Səbinə Əliyeva, Nərmin's and Elvin's mother |

Other demo codes: class join code `7B-MATH-4K2`, parent link code `K7Q42M`.

## Workspace

| Path                 | What                                                     |
| -------------------- | -------------------------------------------------------- |
| `apps/mobile`        | Expo app (Expo Router, NativeWind, TanStack Query)       |
| `apps/api`           | Hono API: demo world on Node and Cloudflare Workers      |
| `apps/admin`         | Content panel (Vite + React)                             |
| `packages/demo-data` | The demo world, its selectors and routes (`DEMO_ROUTES`) |
| `packages/schemas`   | Shared Zod schemas (`src/domain`: the app's domain)      |
| `packages/types`     | Shared domain types                                      |
| `packages/config`    | Shared tsconfig, ESLint config, Tailwind preset, tokens  |

## Commands

```bash
pnpm typecheck   # all packages
pnpm lint
pnpm test
pnpm format      # prettier --write
pnpm --filter @mytutor/mobile dev    # Expo dev server only (i / a / w for iOS / Android / web)
pnpm --filter @mytutor/api dev       # API only, on http://localhost:4000 (see apps/api/.env.example)
pnpm dev:worker                      # the Worker entry locally (wrangler dev, port 8787)
pnpm --filter @mytutor/api check:worker   # bundle the Worker and check it has no book content
pnpm deploy:demo-api                 # deploy the Worker; needs CLOUDFLARE_API_TOKEN and
                                     # CLOUDFLARE_ACCOUNT_ID in the repo-root .env
```
