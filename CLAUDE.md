# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

Vendel is a Cloudflare Workers-based wishlist application for friends and family. The monorepo uses Turbo for task orchestration and pnpm workspaces for package management.

**Current Status:**

- **Production**: The application is live and deployed
- **Access Model**: Closed system with manual admin approval for new users

**Architecture:**

- **API (`apps/api`)**: Hono-based REST API deployed to Cloudflare Workers
  - Drizzle ORM with Cloudflare D1 (SQLite) for data persistence
  - KV namespace for temporary auth sessions (60s TTL)
  - Token-based authentication with refresh token families
  - Two-stage password hashing (client + server salts via scrypt)
  - Role-based authorization: SuperAdmin > Admin > User > Guest
  - Middleware stack: logger, trailing slash, secure headers, CORS, auth, captcha
  - Exports typed client SDK with automatic cookie management

- **Web (`apps/web`)**: SvelteKit 2 application with SSR deployed to Cloudflare Pages
  - Svelte 5 with `$state` reactive primitives
  - Service binding to API worker (direct worker-to-worker, no HTTP roundtrip)
  - TailwindCSS 4.x with custom theme support (light/dark/system)
  - Context-based form system with Zod validation
  - Cloudflare Turnstile for CAPTCHA

- **Shared Packages (`packages/`)**:
  - `@package/crypto-utils`: scrypt hashing, AES-256-GCM encryption, HMAC-SHA256, byte utilities
  - `@package/mail-service`: Email sending via Resend with Danish templates
  - `@package/token-service`: Encrypted and signed JWT-like tokens
  - `@package/validators`: Zod schemas with Danish error messages

- **Shared Configs (`configs/`)**:
  - `@config/eslint`: Function-based ESLint flat config with TypeScript + Svelte support
  - `@config/typescript`: Strict base tsconfig extended by all packages

## Development Commands

```bash
# Root-level commands
pnpm dev              # Start all dev servers (API :7100, web :7000)
pnpm build            # Build all apps
pnpm lint             # Run all linters
pnpm test             # Run all tests
pnpm test:watch       # Run tests in watch mode
pnpm format           # Format code with Prettier

# API-specific (apps/api)
pnpm --filter @app/api dev
pnpm --filter @app/api build
pnpm --filter @app/api deploy -- -e <dev|prod>
pnpm --filter @app/api cf-typegen          # Generate Cloudflare bindings types
pnpm --filter @app/api db:generate         # Generate migrations from schema
pnpm --filter @app/api db:apply            # Apply migrations locally
pnpm --filter @app/api db:apply -- -e <dev|prod> --remote  # Apply to remote D1
pnpm --filter @app/api test
pnpm --filter @app/api vitest run <path>   # Run single test file

# Web-specific (apps/web)
pnpm --filter @app/web dev
pnpm --filter @app/web build
pnpm --filter @app/web deploy -- -e <dev|prod>
pnpm --filter @app/web cf-typegen
```

## API Architecture (`apps/api`)

### Request Flow

1. Request enters through `src/main.ts`
2. Middleware chain processes in order:
   - Logger
   - Trailing slash trimmer
   - Secure headers (X-Frame-Options, Referrer-Policy, CSP)
   - CORS validation (against `CORS_ORIGINS`)
   - Auth context setup (extracts/validates tokens, sets `c.var.auth`)
   - CAPTCHA service initialization (sets `c.var.captcha`)
3. Routes handle business logic
4. Responses follow `Result<T>` = `Ok<T>` | `Err` pattern

### Server Context Type

```typescript
type ServerEnv = {
  Bindings: CloudflareBindings; // D1, KV, env vars
  Variables: {
    auth: AuthContext; // Authenticated | Expired | Unauthenticated
    captcha: CaptchaService; // Turnstile verification
  };
};
```

### Database Schema

**Location**: `apps/api/src/lib/database/schema/`

**Tables** (5 total):

1. **`users`** (`schema/users.ts`):
   - `id` (CUID, 24 chars), `firstName` (64), `middleName` (256, optional), `lastName` (64, optional)
   - `email` (320, unique), `emailVerified` (boolean, default false)
   - `password` (blob), `clientSalt` (64 hex), `serverSalt` (64 hex)
   - `role` (SuperAdmin | Admin | User | Guest, **default Guest**)
   - `approved` (boolean, default false), `approvedBy` (FK to users)
   - `createdAt`, `updatedAt` (auto-managed)

2. **`refresh_token_families`** (`schema/refresh-token-families.ts`):
   - `id` (CUID), `userId` (FK, cascade), `invalidated` (boolean)
   - Purpose: Group tokens for "sign out all devices"

3. **`refresh_tokens`** (`schema/refresh-tokens.ts`):
   - `id` (CUID), `refreshTokenFamilyId` (FK, cascade), `used` (boolean)
   - `expiresAt` (default 30 days)
   - Purpose: One-time use tokens with rotation

4. **`wishlists`** (`schema/wishlists.ts`):
   - `id` (CUID), `name` (128), `description` (256, optional)
   - `wishesUpdatedAt` (tracks when wishes were last modified)
   - `createdAt`, `updatedAt`

5. **`wishes`** (`schema/wishes.ts`):
   - `id` (CUID), `wishlistId` (FK, cascade)
   - `title` (256), `brand` (128, optional), `description` (512, optional)
   - `price` (integer, optional), `url` (2048, optional)
   - `createdAt`, `updatedAt`

**Migration Workflow:**

1. Modify schema in `src/lib/database/schema/`
2. Export from `schema/index.ts`
3. Run `pnpm --filter @app/api db:generate`
4. Review migration in `src/lib/database/migrations/`
5. Run `pnpm --filter @app/api db:apply` to test locally
6. Commit migration with schema changes

### API Routes

```
/
├── GET /                           Health check (returns mode)
├── /auth
│   ├── POST /sign-up/start         Initialize sign-up (returns sessionId, clientSalt)
│   ├── POST /sign-up/finish        Complete sign-up (creates user, sends email)
│   ├── POST /sign-in/start         Initialize sign-in (returns sessionId, clientSalt)
│   ├── POST /sign-in/finish        Complete sign-in (validates password)
│   ├── POST /refresh               Refresh access token
│   └── POST /sign-out              Sign out (deletes token family)
├── /user
│   ├── GET /who-am-i               Get current user info + session
│   └── /email
│       ├── POST /confirm           Verify email with token
│       └── POST /resend            Resend confirmation email
└── /wishlists
    ├── GET /                       List all wishlists
    ├── GET /:id                    Get single wishlist
    ├── POST /                      Create wishlist (Admin+)
    ├── PUT /:id                    Update wishlist (Admin+)
    ├── DELETE /:id                 Delete wishlist (Admin+)
    └── /:wishlistId/wishes
        ├── GET /                   List wishes (ordered by title)
        ├── GET /:wishId            Get single wish
        ├── POST /                  Create wish (User+)
        ├── PUT /:wishId            Update wish (User+)
        └── DELETE /:wishId         Delete wish (User+)
```

### Authentication System

#### Password Security (Two-Stage Hashing)

1. **Client-side**: `passwordClientHash = scrypt(password, clientSalt)`
   - Salt: 32 random bytes, hex-encoded (64 chars)
   - Never sends plaintext password over network

2. **Server-side**: `passwordHash = scrypt(passwordClientHash, serverSalt)`
   - Salt: 32 random bytes per user, stored in DB
   - Final hash stored as blob
   - Prevents rainbow table attacks even if DB compromised

#### Token Types

| Token         | Payload                         | Expiry   | Cookie              | Purpose            |
| ------------- | ------------------------------- | -------- | ------------------- | ------------------ |
| Access        | `{ user: { id, role } }`        | 15 min   | `{prefix}-access`   | API authorization  |
| Refresh       | `{ family, id, accessTokenId }` | 30 days  | `{prefix}-refresh`  | Token rotation     |
| Confirm Email | `{ userId }`                    | 24 hours | N/A (in email link) | Email verification |

#### Auth Middleware (`src/lib/server/middleware/auth.ts`)

Runs on every request:

1. Extracts access + refresh cookies
2. Validates via TokenService (decrypt + verify signature)
3. Validates token linkage (access.id === refresh.accessTokenId)
4. Sets `c.var.auth` to Authenticated, Expired, or Unauthenticated
5. Never throws - gracefully handles all cases

#### Authorization (`src/lib/server/middleware/require-auth.ts`)

**Role Hierarchy**: Guest (0) < User (1) < Admin (2) < SuperAdmin (3)

```typescript
requireGuest(); // Minimum Guest
requireUser(); // Minimum User
requireAdmin(); // Minimum Admin
requireSuperAdmin(); // SuperAdmin only

// With options
requireAuth({
  minRole: AuthRole.Admin,
  allowExpired: true, // For sign-out
  customAuth: async (c, auth) => boolean,
  errorMessage: "Custom 401 message",
});
```

#### Auth Flows

**Sign-Up** (`/auth/sign-up`):

1. Start: Validate email unique, generate salts, create KV session (60s), return sessionId + clientSalt
2. Client hashes password with clientSalt
3. Finish: Retrieve session, hash with serverSalt, create user, send confirmation email, sign in

**Sign-In** (`/auth/sign-in`):

1. Start: Look up user, create KV session with clientSalt (fake salt if user doesn't exist - timing attack prevention)
2. Client hashes password
3. Finish: Validate password hash, sign in (generic 401 prevents email enumeration)

**Token Refresh** (`/auth/refresh`):

- Early return if access token valid for 5+ more minutes
- Verify refresh token in DB, not used, not expired, family not invalidated
- Mark old token as used, create new tokens in same family

**Sign-Out** (`/auth/sign-out`):

- Delete entire token family (cascade deletes all tokens)
- Signs out all devices using tokens from that family

### Client SDK

**Location**: `apps/api/src/lib/client/`

```typescript
const client = createClient({
  prefix: "/api",
  fetch: customFetch,
  headers: { ... },
  hooks: { beforeRequest, afterResponse }
});

// Usage
const result = await client.auth.signIn({ email, password, captchaToken });
if (result.ok) {
  const user = await client.user.whoAmI();
}
```

- In-memory cookie store with automatic forwarding
- Type-safe `ClientResult<T>` = `Ok<T> & { ok: true }` | `Err & { ok: false }`
- Sign-up/sign-in clients handle two-stage flow internally

### Testing

**Framework**: Vitest with `@cloudflare/vitest-pool-workers`

**Infrastructure** (`apps/api/src/test/`):

- `setups/01-migrations.ts` - Applies D1 migrations before tests
- `setups/02-users.ts` - Seeds test users (SuperAdmin, Admin, UserOne, UserTwo)
- `fixtures/users.ts` - Test user data with known passwords
- `utils/fetch.ts` - `testFetch()` for requests to SELF
- `utils/database.ts` - Drizzle instance for test DB

## Web Architecture (`apps/web`)

### Service Binding Setup

**File**: `src/hooks.server.ts`

```typescript
// Creates API client with service binding
const api = createClient({
  prefix: `${event.url.origin}/api`,
  fetch: event.platform?.env.API.fetch, // Direct worker call
  // Cookie forwarding logic...
});
event.locals.api = api;
```

- No HTTP roundtrip between web and API workers
- Cookies automatically forwarded and synced

### Routing

**Structure**: `src/routes/`

```
/                           Home page
/(auth)/
  sign-up/                  Two-step sign-up form
  sign-in/                  Two-step sign-in form
  sign-out/                 Confirmation before logout
  confirm-email/            Email verification callback
/(misc)/
  privacy/                  Privacy policy
/wishlists/
  +page                     List/create/edit/delete wishlists
  [wishlistId]/             Single wishlist with wishes CRUD
```

- Route groups: `(auth)` for auth pages, `(misc)` for other
- Server logic in `+page.server.ts` or `+layout.server.ts`
- Root layout loads user via `whoAmI()` on authenticated requests

### State Management

**Svelte 5 Reactive Stores** (`src/lib/stores/`):

```typescript
// auth.svelte.ts - Authentication state
authStore.setAuthenticated(whoAmI);
authStore.setUnauthenticated();

// layout.svelte.ts - UI state
layoutStore.theme; // "light" | "dark" | "system"
layoutStore.menu.open; // Mobile menu state
layoutStore.size; // Viewport dimensions

// config.svelte.ts - App config
configStore.version;
configStore.turnstileSiteKey;

// navigation.svelte.ts - Nav structure with role-based visibility
```

### Form System

**Context-based validation** (`src/lib/components/form/`):

1. `<Form>` creates unique context with field registry
2. Fields register on mount, unregister on destroy
3. Zod validators run on value change
4. `formContext.setErrors()` maps API errors to fields
5. `formContext.resetCaptchas()` clears CAPTCHA on failure

**Components**:

- `text-input.svelte` - Text/email/password with validation
- `number-input.svelte` - Numeric input
- `captcha-input.svelte` - Turnstile integration
- `form-submit.svelte` - Submit button with loading state

### Auth Components

```svelte
<Authenticated>          <!-- Show if authenticated -->
<AuthAs minRole={...}>   <!-- Show if has minimum role -->
<Unauthenticated>        <!-- Show if NOT authenticated -->
```

### Theme System

- Preferences: Light, Dark, System (uses `prefers-color-scheme`)
- Stored in cookie: `theme-preference` (1-year expiry)
- Applied via `document.documentElement.dataset.theme`
- Custom Tailwind variant: `@custom-variant dark` uses `[data-theme=dark]`

### Styling

**TailwindCSS 4.x** with:

- Custom fonts: Inter Variable (body), Playwrite DK Loopet Variable (headings)
- Color palette: Sky (primary), Stone (neutral)
- Custom `hocus` variant for hover OR focus

## Shared Packages

### @package/crypto-utils

```typescript
// Byte conversions
bytesToHex / hexToBytes;
bytesToBase64 / base64ToBytes; // URL-safe, no padding
utf8ToBytes / bytesToUtf8;
randomBytes(length);

// Cryptography
scrypt(password, salt); // N=65536, r=8, p=1, 256-byte output
hmac(key, hash).sign(data); // HMAC-SHA256 (default)
hmac(key).verify(data, sig);
gcm(key, nonce).encrypt(data); // AES-256-GCM
gcm(key, nonce).decrypt(data);
createId(); // CUID2
```

### @package/token-service

```typescript
const tokenService = new TokenService(
  { encryption: key32, signing: key32 },
  { issuer: "...", audience: "..." },
);

// Create encrypted + signed token
const { id, token } = await tokenService.create(data, { purpose, expiresAt });

// Verify and decrypt
const {
  verified,
  expired,
  token: parsed,
} = await tokenService.read(tokenString);
```

Token format: `v1.<metadata>.<encrypted-data>.<signature>`

### @package/mail-service

```typescript
const mailService = new MailService(resendApiKey, { baseURL }, isDev);

await mailService.send({
  to: { name, address },
  template: MailTemplate.ConfirmEmail,
  data: { name, token },
});
```

- Dev mode logs instead of sending
- Templates in Danish with placeholder replacement

### @package/validators

Zod schemas with Danish error messages:

```typescript
emailValidator; // Required, max 320, email format
firstNameValidator; // Required, max 64
middleNameValidator; // Optional, max 256
lastNameValidator; // Optional, max 64
passwordValidator; // Required, 10-64 chars, complexity rules
passwordHashValidator; // Base64url format
captchaValidator; // Required, max 2048
tokenValidator; // v1.x.x.x format
idValidator; // CUID2 format
wishlistNameValidator; // Required, max 128
wishlistDescriptionValidator; // Optional, max 256
wishTitleValidator; // Required, max 256
wishBrandValidator; // Optional, max 128
wishDescriptionValidator; // Optional, max 512
wishPriceValidator; // Optional number
wishUrlValidator; // Optional, max 2048
```

## Environment Configuration

**Required Secrets** (`.dev.vars` locally, Cloudflare dashboard remotely):

- `TOKEN_ENCRYPTION_KEY` - 32 bytes, hex-encoded
- `TOKEN_SIGNING_KEY` - 32 bytes, hex-encoded
- `RESEND_API_KEY` - Resend API key
- `TURNSTILE_SECRET_KEY` - Cloudflare Turnstile secret

**Environment Variables** (in `wrangler.json`):

- `MODE`: local | dev | prod
- `API_ORIGINS`: Valid API origins (comma-separated)
- `CORS_ORIGINS`: Valid CORS origins
- `COOKIE_PREFIX`: vendel_local | vendel_dev | vendel
- `CANONICAL_ORIGIN`: Primary domain for environment
- `TURNSTILE_SITE_KEY`: Cloudflare Turnstile site key

**Cookie Domains**:

- Local: No domain (localhost)
- Dev/Prod: `.vendel.dk`

## Deployment

**GitHub Actions** (`.github/workflows/`):

- `deploy_dev.yaml`: Push to main → deploy to dev
- `deploy_prod.yaml`: Push tag `v*` → deploy to prod
- `_checks.yaml`: Format → lint → test
- `_deploy.yaml`: Checks → db migrations → deploy

**Domains**:

- Dev: `api.dev.vendel.dk`, `dev.vendel.dk`
- Prod: `api.vendel.dk`, `vendel.dk`, `www.vendel.dk`

## Path Aliases

| Context   | Aliases                                |
| --------- | -------------------------------------- |
| API       | `$lib`, `$routes`, `$test` → `./src/*` |
| Web       | `$lib`, `$routes`, `$test` → `./src/*` |
| Workspace | `@app/*`, `@package/*`, `@config/*`    |

## Important Notes

### General

- **Always run `cf-typegen`** after modifying `wrangler.json`
- **Database migrations auto-apply** during deployment
- **Service binding** means CORS only matters for external clients
- **Turbo caching** enabled; use `--force` to bypass

### Security

- Passwords never transmitted in plaintext (client-side hashing)
- Timing attack prevention on sign-in (fake salt for non-existent users)
- Email enumeration prevention (generic 401 errors)
- Token rotation with one-time use refresh tokens
- Sign-out invalidates entire token family (all devices)
- CAPTCHA required on all auth endpoints

### Common Tasks

**Adding an endpoint**:

1. Create route in `src/routes/` following existing patterns
2. Define types with Zod schemas
3. Implement handler with `requireAuth()` if needed
4. Export client function
5. Add tests as `*.spec.ts`

**Adding a database table**:

1. Create schema in `src/lib/database/schema/`
2. Export from `schema/index.ts`
3. Run `db:generate` then `db:apply`
4. Commit migration with schema

### Planned Features

- **Admin Approval Notifications**: Email admins when new users sign up
- **Admin Panel**: Endpoint for approving/rejecting pending users
- **Wishlist Sharing**: `wishlist_users` table for permissions
