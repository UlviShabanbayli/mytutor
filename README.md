# MyTutor

Kunduz-style education app for Azerbaijan. Demo scope: test practice built from
provided textbooks and test banks. See [CLAUDE.md](CLAUDE.md) for product context, git workflow and code rules.

## Requirements

- Node 24 (`.nvmrc`)
- pnpm 12 (`npm install -g pnpm`)

## Setup

```bash
pnpm install
```

## Workspace

| Path               | What                                                    |
| ------------------ | ------------------------------------------------------- |
| `apps/mobile`      | Expo app (Expo Router, NativeWind, TanStack Query)      |
| `apps/api`         | Hono API (Drizzle + PostgreSQL)                         |
| `packages/schemas` | Shared Zod schemas                                      |
| `packages/types`   | Shared domain types                                     |
| `packages/config`  | Shared tsconfig, ESLint config, Tailwind preset, tokens |

## Commands

```bash
pnpm typecheck   # all packages
pnpm lint
pnpm test
pnpm format      # prettier --write
pnpm --filter @mytutor/mobile dev    # Expo dev server (i / a / w for iOS / Android / web)
pnpm --filter @mytutor/api dev       # API on http://localhost:3000 (copy apps/api/.env.example to .env)
```
