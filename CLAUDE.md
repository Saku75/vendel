# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vendel is a Cloudflare Workers-based application with two main apps: an API (Hono) and a web frontend (SvelteKit). The monorepo uses Turbo for task orchestration and pnpm workspaces for package management.

**Architecture:**

- **API (`apps/api`)**: Hono-based REST API deployed to Cloudflare Workers
  - Uses Drizzle ORM with Cloudflare D1 (SQLite) for data persistence
  - KV namespace for session/cache storage
  - Token-based authentication with refresh tokens
  - Middleware stack: captcha, database, mail, token service, auth
  - Exports a typed client SDK consumed by the web app
- **Web (`apps/web`)**: SvelteKit application with SSR deployed to Cloudflare Pages
  - Communicates with API via exported client SDK
  - Uses service binding to call API worker directly (no HTTP roundtrip)
  - TailwindCSS 4.x for styling
  - Cloudflare Turnstile for CAPTCHA
- **Shared Packages (`packages/`)**: Workspace packages used across apps
  - `@package/captcha`: Turnstile CAPTCHA verification
  - `@package/crypto-utils`: Encryption/hashing utilities
  - `@package/mail-service`: Email sending via Resend
  - `@package/token-service`: JWT token generation/validation
  - `@package/validators`: Zod schemas for validation
- **Configs (`configs/`)**: Shared ESLint and TypeScript configurations

## Development Commands

### Root-level commands

```bash
# Start all dev servers (API on :8787, web on :5173)
pnpm dev

# Build all apps
pnpm build

# Run all linters
pnpm lint

# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Format code
pnpm format
```

### API-specific commands (`apps/api`)

```bash
# Run API dev server only
pnpm --filter @app/api dev

# Build API
pnpm --filter @app/api build

# Deploy API (requires CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN)
pnpm --filter @app/api deploy -- -e <dev|prod>

# Generate Cloudflare bindings types
pnpm --filter @app/api cf-typegen

# Database operations
pnpm --filter @app/api db:generate  # Generate migrations from schema
pnpm --filter @app/api db:apply     # Apply migrations locally
pnpm --filter @app/api db:apply -- -e <dev|prod> --remote  # Apply to remote D1

# Run API tests
pnpm --filter @app/api test

# Run single test file
pnpm --filter @app/api vitest run <path-to-test>
```

### Web-specific commands (`apps/web`)

```bash
# Run web dev server only
pnpm --filter @app/web dev

# Build web app
pnpm --filter @app/web build

# Deploy web app
pnpm --filter @app/web deploy -- -e <dev|prod>

# Generate Cloudflare bindings types
pnpm --filter @app/web cf-typegen
```

## Key Architecture Details

### API Request Flow

1. Request enters through `apps/api/src/main.ts`
2. Middleware chain processes request (CORS, security headers, auth, etc.)
3. Routes in `apps/api/src/routes/` handle business logic
4. Database access via Drizzle ORM (`apps/api/src/lib/server/database/`)
5. Responses follow typed result pattern (`Ok` or `Err` from `$lib/types/result`)

### Web-to-API Communication

The web app uses a service binding to call the API worker directly:

- Client created in `hooks.server.ts` with `event.platform.env.API.fetch`
- No HTTP roundtrip; direct worker-to-worker communication
- Cookies automatically forwarded and synced between apps
- Client SDK defined in `apps/api/src/lib/client/index.ts`

### Database Schema & Migrations

- Schema files: `apps/api/src/lib/server/database/schema/*.ts`
- Drizzle config: `apps/api/drizzle.config.ts`
- Migrations: `apps/api/src/lib/server/database/migrations/`
- **Workflow:**
  1. Modify schema files
  2. Run `pnpm --filter @app/api db:generate` to create migration
  3. Run `pnpm --filter @app/api db:apply` to apply locally
  4. Deploy applies migrations automatically via GitHub Actions

### Authentication System

- Token-based auth with refresh tokens stored in D1
- Token families track rotation for security
- Auth middleware in `apps/api/src/lib/server/middleware/auth.ts`
- Require-auth middleware enforces authentication on routes
- Email-based sign-up/sign-in flow with confirmation tokens

### Testing

- Vitest for unit tests
- `@cloudflare/vitest-pool-workers` for API tests (provides D1, KV bindings)
- Test files: `*.spec.ts` or `*.test.ts`
- API tests require `.dev.vars` file with secrets (auto-configured in CI)

### Environment Configuration

- Local: `.dev.vars` files (not committed) contain secrets
- Remote: Secrets managed via Cloudflare dashboard or wrangler secrets
- Environment variables in `wrangler.json` under `env.dev` and `env.prod`
- Required secrets: `TOKEN_ENCRYPTION_KEY`, `TOKEN_SIGNING_KEY`, `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`

### Deployment

- Automated via GitHub Actions (`.github/workflows/deploy_*.yaml`)
- Separate workflows for dev and prod environments
- Deployment runs: format check → lint → tests → db migrations → deploy
- Manual deploy: `pnpm --filter <app> deploy -- -e <dev|prod>`

## Project Structure Conventions

### API Routes

- Routes in `apps/api/src/routes/` use Hono router
- Each route exports client types via `*.client.ts` files
- Tests colocated as `*.spec.ts` files
- Route groups organized by domain (e.g., `auth/`, `user/`)

### Web Routes

- SvelteKit file-based routing in `apps/web/src/routes/`
- Route groups: `(auth)` for authentication pages, `(misc)` for other pages
- Server-side logic in `+page.server.ts` or `+layout.server.ts`
- API client accessed via `event.locals.api` in server code

### Path Aliases

- API: `$lib`, `$routes`, `$test` (tsconfig.json)
- Web: `$lib`, `$routes`, `$test` (svelte.config.js)
- Packages use `@package/<name>`, apps use `@app/<name>`, configs use `@config/<name>`

### Type Safety

- Strict TypeScript configuration via `@config/typescript`
- Cloudflare bindings auto-generated in `worker-env.d.ts`
- Zod validators in `@package/validators` shared between API and web
- API client provides end-to-end type safety

## Important Notes

- **Always run `cf-typegen`** after modifying `wrangler.json` to update types
- **Database migrations are auto-applied** during deployment; test locally first
- **Service binding** means web app calls API directly; CORS only matters for external clients
- **Turbo caching** is enabled; use `--force` flag to bypass if needed
- **Path aliases** require both `tsconfig.json` and build tool configuration
- The `apps/api_new` directory exists but appears to be a work-in-progress; primary API is `apps/api`
