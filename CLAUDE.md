# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack web application built with a monorepo structure using Turbo. The project consists of:

- **API** (`apps/api`): Hono-based API running on Cloudflare Workers with D1 database
- **Web** (`apps/web`): SvelteKit frontend with Tailwind CSS
- **Mail** (`apps/mail`): Email service worker
- **Packages** (`packages/`): Shared libraries and utilities

## Development Commands

### Core Commands

- `pnpm dev` - Start development servers for all apps
- `pnpm build` - Build all applications and packages
- `pnpm lint` - Run linting across all projects
- `pnpm test` - Run tests across all projects
- `pnpm test:watch` - Run tests in watch mode
- `pnpm format` - Format code with Prettier

### API-Specific Commands

- `pnpm --filter @app/api dev` - Start API development server only
- `pnpm --filter @app/api build` - Build API only
- `pnpm --filter @app/api deploy` - Deploy API to Cloudflare Workers
- `pnpm --filter @app/api cf-typegen` - Generate Cloudflare types
- `pnpm --filter @app/api db:generate` - Generate database migrations
- `pnpm --filter @app/api db:apply` - Apply database migrations
- `pnpm --filter @app/api test` - Run tests

### Web-Specific Commands

- `pnpm --filter @app/web dev` - Start web development server only
- `pnpm --filter @app/web build` - Build web app only
- `pnpm --filter @app/web deploy` - Deploy web app to Cloudflare Pages
- `pnpm --filter @app/web cf-typegen` - Generate Cloudflare types

## Architecture

### Monorepo Structure

- Uses Turbo for build orchestration and caching
- PNPM workspaces for package management
- Shared packages for common functionality (validators, mail, token, captcha)

### API Architecture

- **Framework**: Hono with Cloudflare Workers runtime
- **Database**: Drizzle ORM with Cloudflare D1 (SQLite)
- **Authentication**: Custom JWT-based auth with refresh tokens
- **Middleware Stack**: CORS, security headers, logging, auth, captcha, database, mail, token
- **Testing**: Vitest with Cloudflare Workers test environment

### Web Architecture

- **Framework**: SvelteKit 5 with TypeScript
- **Styling**: Tailwind CSS v4 with custom design system
- **State Management**: Svelte 5 runes and stores
- **API Integration**: Custom typed client consuming the API
- **Deployment**: Cloudflare Pages with SSR

### Database Schema

- Users table with email, password, roles, status
- Refresh token families for security
- Auth session management with JWT tokens

### Key Technical Patterns

- **Type Safety**: Shared validators and types across API/Web
- **Authentication Flow**: Email/password with email confirmation
- **API Client**: Type-safe client with automatic cookie handling
- **Middleware**: Composable middleware pattern in API
- **Component Architecture**: Reusable Svelte components with consistent styling

## Development Workflow

### Running Tests

- API tests use Vitest with Cloudflare Workers pool
- Test database migrations are applied automatically
- Use `pnpm test:watch` for development

### Database Development

- Migrations are in `apps/api/src/lib/database/migrations/`
- Use `pnpm --filter @app/api db:generate` to create new migrations
- Apply with `pnpm --filter @app/api db:apply`

### Environment Configuration

- Local development uses `wrangler.json` for Cloudflare bindings
- Different environments (dev/prod) configured in wrangler.json
- D1 database and KV storage bindings configured per environment

### Code Style

- Prettier configuration with import sorting and Tailwind class sorting
- ESLint configuration per package
- Import order: @app/_ → @package/_ → $app/_ → $env/_ → $lib/_ → $routes/_ → relative imports
- Pre-commit hook automatically formats files with Prettier before commits

## Best Practices

- Keep commit messages to one line
