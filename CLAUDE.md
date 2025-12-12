# CLAUDE.md

## Project Overview

Vendel is a Cloudflare Workers-based wishlist application. Monorepo with Turbo + pnpm workspaces.

**Stack:**

- **API** (`apps/api`): Hono REST API on CF Workers, Drizzle ORM + D1, token-based auth with refresh families
- **Web** (`apps/web`): SvelteKit 2 + Svelte 5 on CF Workers, service binding to API worker
- **Packages**: `@package/crypto-utils`, `@package/mail-service`, `@package/token-service`, `@package/validators`
- **Configs**: `@config/eslint`, `@config/typescript`

## Commands

```bash
# Root
pnpm dev                    # Start all (API :7100, web :7000)
pnpm build | lint | test    # All apps
pnpm format                 # Prettier

# API
pnpm --filter @app/api dev | build | test
pnpm --filter @app/api deploy -- -e <dev|prod>
pnpm --filter @app/api cf-typegen           # After wrangler.json changes
pnpm --filter @app/api db:generate          # Generate migrations from schema
pnpm --filter @app/api db:apply             # Apply locally
pnpm --filter @app/api db:apply -- -e <dev|prod> --remote

# Web
pnpm --filter @app/web dev | build
pnpm --filter @app/web deploy -- -e <dev|prod>
pnpm --filter @app/web cf-typegen
```

## Database Schema

**Location**: `apps/api/src/lib/database/schema/` (7 tables)

| Table                    | Key Fields                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------ |
| `users`                  | id, firstName, middleName?, lastName?, role (Guest→SuperAdmin), approved, approvedBy |
| `user_emails`            | userId (FK), email (unique), verified, primary                                       |
| `user_passwords`         | userId (FK), passwordHash, clientSalt, serverSalt, version, current                  |
| `refresh_token_families` | userId (FK), invalidated                                                             |
| `refresh_tokens`         | refreshTokenFamilyId (FK), used, expiresAt                                           |
| `wishlists`              | name, description?, wishesUpdatedAt                                                  |
| `wishes`                 | wishlistId (FK), title, brand?, description?, price?, url?                           |

**Migration workflow**: Modify schema → export from `schema/index.ts` → `db:generate` → `db:apply` → commit

## API Routes

```
GET  /                              Health check
POST /auth/sign-up/start|finish     Two-stage sign-up
POST /auth/sign-in/start|finish     Two-stage sign-in
POST /auth/refresh                  Token refresh
POST /auth/sign-out                 Sign out (deletes token family)
GET  /user/who-am-i                 Current user + session
POST /user/email/confirm|resend     Email verification
CRUD /wishlists                     Admin+ for create/update/delete
CRUD /wishlists/:id/wishes          User+ for create/update/delete
```

## Authentication

**Two-stage password hashing**: Client hashes with clientSalt, server hashes result with serverSalt. Plaintext never sent.

**Tokens**: Access (15min, cookie), Refresh (30d, one-time use, family rotation), ConfirmEmail (24h, in email link)

**Role hierarchy**: Guest (0) < User (1) < Admin (2) < SuperAdmin (3)

```typescript
// Authorization middleware
requireGuest() | requireUser() | requireAdmin() | requireSuperAdmin();
requireAuth({ minRole, allowExpired, customAuth, errorMessage });
```

**Security measures**: Timing attack prevention (fake salts), email enumeration prevention (generic 401s), CAPTCHA on auth endpoints

## Web Architecture

- Service binding in `hooks.server.ts` - direct worker-to-worker calls
- Svelte 5 stores in `src/lib/stores/`: auth, layout, config, navigation
- Context-based form system with Zod Mini validation
- Theme: light/dark/system via `data-theme` attribute

## Shared Packages

| Package                  | Purpose                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| `@package/crypto-utils`  | scrypt, AES-256-GCM, HMAC-SHA256, CUID2, byte conversions                                  |
| `@package/token-service` | Encrypted + signed tokens (format: `v1.<meta>.<data>.<sig>`)                               |
| `@package/mail-service`  | Resend integration, Danish templates (confirm-email-new/resend, welcome, approval-request) |
| `@package/validators`    | Zod Mini schemas with Danish errors                                                        |

## Environment

**Secrets** (`.dev.vars` / CF dashboard): `TOKEN_ENCRYPTION_KEY`, `TOKEN_SIGNING_KEY`, `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`

**Env vars** (`wrangler.json`): `MODE`, `API_ORIGINS`, `CORS_ORIGINS`, `COOKIE_PREFIX`, `CANONICAL_ORIGIN`, `TURNSTILE_SITE_KEY`

**Deployment**: GitHub Actions - push to main deploys dev, tag `v*` deploys prod. Migrations auto-apply.

## Path Aliases

`$lib`, `$routes`, `$test` → `./src/*` (per app) | `@app/*`, `@package/*`, `@config/*` (workspace)

## Important Notes

- Run `cf-typegen` after modifying `wrangler.json`
- Service binding means CORS only matters for external clients
- Tests use `@cloudflare/vitest-pool-workers` with fixtures in `apps/api/src/test/`

## Common Tasks

**Add endpoint**: Create route → Zod schemas → handler with `requireAuth()` → export client → tests

**Add table**: Create schema → export from index → `db:generate` → `db:apply` → commit migration

## Planned Features

- Admin approval notifications (email admins on signup)
- Admin panel for approving/rejecting users
- Wishlist sharing (`wishlist_users` permissions table)
