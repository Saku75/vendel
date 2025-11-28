# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vendel is a Cloudflare Workers-based wishlist application for friends and family. The monorepo uses Turbo for task orchestration and pnpm workspaces for package management.

**Current Status:**

- **Development Stage**: All apps are in active development, aiming for feature completion soon
- **Access Model**: Closed system with manual admin approval for new users

**Architecture:**

- **API (`apps/api`)**: Hono-based REST API deployed to Cloudflare Workers
  - Uses Drizzle ORM with Cloudflare D1 (SQLite) for data persistence
  - KV namespace for temporary auth sessions
  - Token-based authentication with refresh token families
  - Two-stage password hashing (client + server salts)
  - Role-based authorization: SuperAdmin, Admin, User, Guest
  - Middleware stack: auth, require-auth, captcha, CORS, security headers
  - Exports a typed client SDK with automatic cookie management
  - **Planned Features**: Wishlist management (wishlists, wishes, wishlist_users schemas + endpoints)

- **Web (`apps/web`)**: SvelteKit application with SSR deployed to Cloudflare Pages
  - Communicates with API via exported client SDK
  - Uses service binding to call API worker directly (no HTTP roundtrip)
  - TailwindCSS 4.x for styling
  - Cloudflare Turnstile for CAPTCHA
  - **Current Status**: Requires significant frontend work (handled separately)

- **Shared Packages (`packages/`)**: Workspace packages used across apps
  - `@package/captcha`: Turnstile CAPTCHA verification
  - `@package/crypto-utils`: Encryption/hashing utilities (scrypt for password hashing)
  - `@package/mail-service`: Email sending via Resend
  - `@package/token-service`: JWT token generation/validation with encryption + signing
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

# Run tests in watch mode
pnpm --filter @app/api test:watch

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

## Key Architecture Details (apps/api)

### API Request Flow

1. Request enters through `apps/api/src/main.ts`
2. Middleware chain processes request in order:
   - Trailing slash trimmer
   - Secure headers (CSP, X-Frame-Options, etc.)
   - CORS headers (origin validation against `CORS_ORIGINS`)
   - Auth context setup (extracts and validates tokens, sets `c.get('auth')`)
   - CAPTCHA verification (sets `c.get('captcha')` service)
3. Routes in `apps/api/src/routes/` handle business logic
4. Database access via Drizzle ORM (`apps/api/src/lib/database/`)
5. Responses follow typed result pattern: `Result<T>` = `Ok<T>` | `Err`

### Type-Safe Server Context

```typescript
type ServerEnv = {
  Bindings: CloudflareBindings; // D1, KV, environment variables
  Variables: {
    auth: AuthContext; // Authenticated | Expired | Unauthenticated
    captcha: CaptchaService; // Turnstile verification service
  };
};
```

### Web-to-API Communication

The web app uses a service binding to call the API worker directly:

- Client created in `hooks.server.ts` with `event.platform.env.API.fetch`
- No HTTP roundtrip; direct worker-to-worker communication
- Cookies automatically forwarded and synced between apps
- Client SDK defined in `apps/api/src/lib/client/index.ts`
- Client automatically manages cookies via in-memory Map
- Type-safe `ClientResult<T>` = `Ok<T> & { ok: true }` | `Err & { ok: false }`

### Database Schema & Migrations

**Location**: `apps/api/src/lib/database/`

**Current Schema** (3 tables):

1. **`users`** (`schema/users.ts`):
   - id (CUID), firstName, middleName (optional), lastName, email (unique)
   - password (blob - hashed with client + server salts), clientSalt, serverSalt
   - role (SuperAdmin | Admin | User | Guest - default User)
   - emailVerified (boolean), approved (boolean), approvedBy (FK to users)
   - createdAt, updatedAt (auto-managed)

2. **`refresh_token_families`** (`schema/refresh-token-families.ts`):
   - id (CUID), userId (FK), invalidated (boolean)
   - createdAt, updatedAt
   - Purpose: Group refresh tokens for "sign out all devices" functionality

3. **`refresh_tokens`** (`schema/refresh-tokens.ts`):
   - id (CUID), refreshTokenFamilyId (FK), used (boolean)
   - expiresAt (default 30 days from creation), createdAt, updatedAt
   - Purpose: One-time use tokens with rotation security

**Planned Schema** (wishlist features):

- `wishlists` - Wishlist containers
- `wishes` - Individual wish items
- `wishlist_users` - User permissions/sharing for wishlists

**Migration Workflow:**

1. Modify schema files in `apps/api/src/lib/database/schema/`
2. Run `pnpm --filter @app/api db:generate` to create migration
3. Run `pnpm --filter @app/api db:apply` to apply locally
4. Deploy applies migrations automatically via GitHub Actions

**Drizzle Config**: `apps/api/drizzle.config.ts`

- SQLite dialect with snake_case casing conversion
- Migrations stored in `src/lib/database/migrations/`

### Authentication System

**Architecture**: Token-based auth with refresh token families for security

#### Password Security (Two-Stage Hashing)

1. **Client-side hashing** (in browser/client):

   ```
   passwordClientHash = scrypt(password, clientSalt)
   ```

   - Client salt is random, generated on sign-up start
   - Sent to server as base64 string
   - **Never sends plaintext password over network**

2. **Server-side hashing** (in API):

   ```
   passwordHash = scrypt(passwordClientHash, serverSalt)
   ```

   - Server salt is random, stored per-user in DB
   - Final hash stored in DB as blob
   - Prevents rainbow table attacks even if DB is compromised

#### Token Types

**Access Token** (`src/lib/types/auth/tokens/access.ts`):

- Payload: `{ user: { id, role } }`
- Expiry: 15 minutes
- Stored in cookie: `{hostname_prefix}-access`
- Used for API authorization

**Refresh Token** (`src/lib/types/auth/tokens/refresh.ts`):

- Payload: `{ family, id, accessTokenId }`
- Expiry: 30 days
- Stored in cookie: `{hostname_prefix}-refresh`
- Links to token family for rotation tracking

**Confirm Email Token** (`src/lib/types/user/tokens/confirm-email.ts`):

- Payload: `{ userId }`
- Purpose: Email verification link sent on sign-up
- Expiry: 24 hours

#### Auth Middleware (`src/lib/server/middleware/auth.ts`)

Runs on **every request** to establish auth context:

1. Extracts `access` and `refresh` cookies
2. Validates tokens via TokenService (decrypt + verify signature)
3. Sets `c.get('auth')` to one of:
   - `{ status: Authenticated, access: {...}, refresh: {...} }`
   - `{ status: Expired, access: {...}, refresh: {...} }` (expired but valid structure)
   - `{ status: Unauthenticated }` (missing or invalid tokens)
4. Never throws errors - gracefully handles all cases

#### Authorization Middleware (`src/lib/server/middleware/require-auth.ts`)

**Role Hierarchy**: Guest (0) < User (1) < Admin (2) < SuperAdmin (3)

**Helper Functions**:

- `requireAuth(options?)` - Main factory with custom options
- `requireGuest()` - Minimum Guest role
- `requireUser()` - Minimum User role
- `requireAdmin()` - Minimum Admin role
- `requireSuperAdmin()` - SuperAdmin only

**Options**:

- `minRole`: Minimum role required (default: User)
- `allowExpired`: Accept expired tokens (useful for sign-out)
- `customAuth`: Custom authorization callback
- `errorMessage`: Custom 401 error message

**Example Usage**:

```typescript
// Require authenticated user
app.post("/protected", requireUser(), async (c) => {
  const auth = getAuth(c); // Type-safe: Authenticated context only
  return c.json({ userId: auth.access.user.id });
});

// Require admin with custom logic
app.post(
  "/admin",
  requireAdmin({
    customAuth: async (c, auth) => {
      // Additional checks beyond role
      return someCondition;
    },
  }),
  handler,
);
```

#### Auth Flows

**Sign-Up Flow** (`src/routes/auth/sign-up/`):

1. **Start** (`POST /auth/sign-up/start`):
   - Input: firstName, middleName?, lastName?, email, captchaToken
   - Validates email doesn't exist
   - Generates random clientSalt (16 bytes) and serverSalt (16 bytes)
   - Creates KV session (60s TTL) with: email, salts, captcha idempotency key
   - Returns: sessionId, clientSalt
   - **Client then hashes password with clientSalt**

2. **Finish** (`POST /auth/sign-up/finish`):
   - Input: sessionId, passwordClientHash, captchaToken
   - Retrieves and validates KV session
   - Hashes passwordClientHash with serverSalt
   - Creates user in DB (emailVerified=false, approved=false by default)
   - Generates and sends confirm email token via email
   - Calls `signIn()` to set auth cookies
   - Deletes KV session
   - Returns success with cookies set

**Sign-In Flow** (`src/routes/auth/sign-in/`):

1. **Start** (`POST /auth/sign-in/start`):
   - Input: email, captchaToken
   - Looks up user by email
   - **Timing attack prevention**: If user doesn't exist, generates fake clientSalt
   - Creates KV session (60s TTL) with: email, clientSalt, captcha key
   - Returns: sessionId, clientSalt (real or fake - same response time)
   - **Client then hashes password with clientSalt**

2. **Finish** (`POST /auth/sign-in/finish`):
   - Input: sessionId, passwordClientHash, captchaToken
   - Retrieves KV session
   - Looks up user by email + hashed password
   - **Generic 401 error** if not found (prevents email enumeration)
   - Calls `signIn()` on success
   - Deletes KV session
   - Returns success with cookies set

**Shared Sign-In Logic** (`src/lib/auth/flows/sign-in.ts`):

```typescript
async function signIn(c, { userId, userRole }):
  1. Create refresh_token_family (userId)
  2. Create refresh_token (familyId, expiresAt = now + 30d)
  3. Generate access token (15m expiry)
  4. Generate refresh token payload (links to access token)
  5. Set both cookies via TokenService
  6. Return success
```

**Token Refresh Flow** (`src/lib/auth/flows/refresh.ts`):

1. `POST /auth/refresh` (requires auth, allows expired)
2. **Early return**: If access token valid for 5+ more minutes, skip refresh
3. Verify refresh token exists in DB and not marked as used
4. Verify refresh token not expired (expiresAt > now)
5. Verify token family not invalidated
6. Mark old refresh token as `used: true`
7. Create new refresh token in same family
8. Generate new access token
9. Link tokens (accessTokenId in refresh cookie)
10. Set both cookies
11. Return success

**Sign-Out Flow** (`src/lib/auth/flows/sign-out.ts`):

1. `POST /auth/sign-out` (requires auth, allows expired)
2. Extract refresh token family ID from auth context
3. **Delete entire token family** from DB (cascade deletes all tokens)
4. Clear access + refresh cookies
5. **Effect**: Signs out all devices using tokens from that family

#### Approval Workflow (Planned)

**Current State**:

- User schema has `approved` (boolean) and `approvedBy` (FK) fields
- New users default to `approved: false`
- **Not yet implemented**: Email notification to Admins on new sign-ups
- **Not yet implemented**: Admin endpoint to approve users
- **Intended behavior**: Admins receive email when new user signs up, can manually approve via admin panel

### Testing

**Framework**: Vitest with `@cloudflare/vitest-pool-workers`

- Provides D1, KV bindings in test environment
- Test files: `*.spec.ts` or `*.test.ts`
- API tests require `.dev.vars` file with secrets (auto-configured in CI)

**Test Infrastructure** (`apps/api/src/test/`):

**Setup Hooks** (`setups/`):

- `01-migrations.ts` - Applies D1 migrations before tests run
- `02-users.ts` - Seeds test users with different roles and states

**Fixtures** (`fixtures/users.ts`):

- Pre-defined test users: SuperAdmin, Admin, UserOne, UserTwo
- Known passwords and states for testing auth flows
- Different approval/verification combinations

**Utilities** (`utils/`):

- `testFetch()` - Configured fetch function for making requests to SELF
- `testDatabase` - Drizzle instance connected to test D1 binding

**Test Coverage**:

- Sign-up flow: 11+ test cases (session creation, validation, full flow)
- Sign-in flow: 13+ test cases (timing attack prevention, password validation)
- Sign-out flow: 3+ test cases (token family deletion, auth requirements)
- User endpoints: 12+ test cases (who-am-i, email confirmation, resend)

**Testing Philosophy**:

- Tests are helpful but not critical (personal project)
- Focus on happy paths and security-critical flows
- Tests may fail occasionally - acceptable for this use case

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

### API Routes (`apps/api`)

**Location**: `apps/api/src/routes/`

**Structure**:

- Routes organized by domain (e.g., `auth/`, `user/`, `wishlist/`)
- Each route group is a separate Hono server instance
- Modular composition via `route()` method in parent router
- Tests colocated as `*.spec.ts` files

**Current Routes**:

```
/
├── / (GET)                          - Health check
├── /auth
│   ├── /sign-up
│   │   ├── /start (POST)            - Initialize sign-up session
│   │   └── /finish (POST)           - Complete sign-up
│   ├── /sign-in
│   │   ├── /start (POST)            - Initialize sign-in session
│   │   └── /finish (POST)           - Complete sign-in
│   ├── /refresh (POST)              - Refresh access token
│   └── /sign-out (POST)             - Sign out (delete tokens)
└── /user
    ├── /who-am-i (GET)              - Get current authenticated user info
    └── /email
        ├── /confirm (POST)          - Verify email confirmation token
        └── /resend (POST)           - Resend email confirmation
```

**Planned Routes** (wishlist features):

- `/wishlists` - CRUD operations for wishlists
- `/wishes` - CRUD operations for wishes within wishlists
- `/wishlists/:id/users` - Manage wishlist sharing/permissions

**Client Exports**:

- Each route group exports typed client functions
- Main client: `createClient()` from `src/lib/client/index.ts`
- Aggregated in client SDK: `client.auth.signUp()`, `client.auth.signIn()`, etc.

### Web Routes

- SvelteKit file-based routing in `apps/web/src/routes/`
- Route groups: `(auth)` for authentication pages, `(misc)` for other pages
- Server-side logic in `+page.server.ts` or `+layout.server.ts`
- API client accessed via `event.locals.api` in server code
- **Status**: Requires significant frontend work (separate from API development)

### Path Aliases

- **API** (`apps/api`): `$lib`, `$routes`, `$test` (tsconfig.json)
- **Web**: `$lib`, `$routes`, `$test` (svelte.config.js)
- **Packages**: `@package/<name>` - Shared utilities and services
- **Apps**: `@app/<name>` - Application packages
- **Configs**: `@config/<name>` - Shared configurations

### Type Safety

- Strict TypeScript configuration via `@config/typescript`
- Cloudflare bindings auto-generated in `worker-env.d.ts`
- Zod validators in `@package/validators` shared between API and web
- API client provides end-to-end type safety

## Important Notes

### General

- **Personal Project**: This is a friends & family wishlist app with manual approval workflow
- **Development Timeline**: Aiming for feature completion soon
- **Testing**: Tests are helpful but not critical; occasional failures are acceptable
- **Service binding**: Web app calls API directly via worker binding; CORS only matters for external clients
- **Turbo caching**: Enabled; use `--force` flag to bypass if needed

### API Development (`apps/api`)

- **Always run `cf-typegen`** after modifying `wrangler.json` to update bindings types
- **Database migrations are auto-applied** during deployment; test locally first with `db:apply`
- **Path aliases** (`$lib`, `$routes`, `$test`) require both `tsconfig.json` and build config
- **Cookie namespacing**: Cookies auto-prefixed with hostname (e.g., `localhost-access`, `vendel-access`)
- **Two-stage auth flows**: All auth operations use KV sessions with 60s TTL between start/finish
- **Password security**: Two-stage hashing (client + server salts) means passwords are never transmitted in plaintext
- **Token families**: Enable "sign out all devices" by grouping refresh tokens
- **Role hierarchy**: Guest (0) < User (1) < Admin (2) < SuperAdmin (3)
- **CAPTCHA required**: All auth endpoints require valid Turnstile token

### Common Tasks

**Scaffolding new endpoints**:

1. Create route file in `src/routes/` following existing patterns
2. Define request/response types using Zod schemas
3. Implement handler with proper error handling
4. Export client function for SDK
5. Add tests colocated as `*.spec.ts`
6. Update CLAUDE.md if adding major features

**Adding database tables**:

1. Create schema file in `src/lib/database/schema/`
2. Export from `src/lib/database/schema/index.ts`
3. Run `pnpm --filter @app/api db:generate`
4. Review generated migration in `src/lib/database/migrations/`
5. Run `pnpm --filter @app/api db:apply` to test locally
6. Commit migration with schema changes

**Writing tests**:

1. Use test utilities from `src/test/utils/`
2. Leverage test fixtures for users with known credentials
3. Use `testFetch()` for making authenticated requests
4. Focus on security-critical flows and happy paths
5. Tests may fail occasionally - iterate as needed

### Known Issues & TODOs

**Planned Features**:

- **Wishlist System**: Add `wishlists`, `wishes`, `wishlist_users` schemas
- **Wishlist APIs**: CRUD endpoints for wishlist management
- **Admin Approval**: Email notifications to admins on new user sign-ups
- **Admin Panel**: Endpoint for admins to approve/reject pending users

**Testing Notes**:

- Test suite is best-effort for personal project
- Some edge cases may not be covered
- Focus on security-critical flows and happy paths
