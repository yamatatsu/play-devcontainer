# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Turborepo monorepo development environment running in DevContainer with:
- **Backend**: Hono API server with TypeScript
- **Frontend**: React + Vite with TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: Microsoft Entra ID (Azure AD) using JWT bearer tokens
- **Logger**: Pino (structured logging)
- **Monorepo Management**: Turborepo with npm workspaces
- **Code Quality**: Biome (formatter + linter), cspell (spell check)

## Development Commands

All commands should be run from the repository root using Turborepo unless specified otherwise.

### Starting Development
```bash
# Start backend dev server (runs on port 3000)
turbo dev

# Start frontend dev server (runs on port 5173)
cd apps/frontend && npm run dev
```

### Database Operations
```bash
# Apply migrations in development (creates migration files for schema changes)
turbo db:migrate:dev

# Apply migrations in production (runs existing migrations only)
turbo db:migrate:deploy

# Seed database with initial data
turbo db:seed

# Open Prisma Studio GUI (runs on port 5555)
turbo db:studio

# Generate Prisma client after schema changes
turbo db:generate
```

### Testing
```bash
# Run all tests in watch mode
turbo test

# Run all tests once and exit
turbo test:run

# Run single test file
cd apps/backend && npm run test -- src/routes/tasks/list.test.ts
```

### Code Quality
```bash
# Run all checks (Biome, spell check, type check)
npm run check

# Format code with Biome
npm run format

# Fix Biome issues
npm run fix:biome

# Type check
turbo check:type
```

### Build
```bash
# Build all packages
turbo build

# Clean build artifacts
turbo clean
```

## Architecture

### Monorepo Structure
```
apps/
  backend/           # Hono API server
  frontend/          # React + Vite app
packages/
  db/                # Prisma client and schema
  logger/            # Pino logger configuration
```

### Backend (Hono)

**Entry Point**: `apps/backend/src/index.ts` starts the server on port 3000
**App Configuration**: `apps/backend/src/app.ts` defines routes and middleware chain

**Middleware Order** (defined in `apps/backend/src/app.ts:12-24`):
1. Logger middleware - logs all requests
2. CORS middleware - handles cross-origin requests
3. Bearer auth middleware - validates JWT tokens from Entra ID
4. Route handlers

**Authentication Flow**:
- Frontend acquires JWT token from Microsoft Entra ID (`apps/frontend/src/auth.tsx:76`)
- Frontend attaches token to all API requests (`apps/frontend/src/api/client.ts:10`)
- Backend validates JWT using JWKS from Entra ID (`apps/backend/src/middlewares/bearerAuth.ts:14`)
- JWT payload is extracted and stored in Hono context as `jwtPayload` (`apps/backend/src/middlewares/bearerAuth.ts:61`)
- Route handlers access user info via `c.get("jwtPayload")`

**Repository Pattern**:
- Domain models in `apps/backend/src/domain/model/`
- Database operations in `apps/backend/src/infra/*-repository.ts`
- Routes call repository functions, never Prisma directly

**Environment Variables**:
Backend requires (see `apps/backend/.env.example`):
- `ENTRA_TENANT_NAME` - Entra domain prefix (not tenant name)
- `ENTRA_TENANT_ID` - Entra tenant ID
- `ENTRA_CLIENT_ID` - Entra client ID
- `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DBNAME` - set by DevContainer

### Frontend (React + Vite)

**Entry Point**: `apps/frontend/src/main.tsx`
**Authentication**: Uses `@azure/msal-react` with `MsalAuthenticationTemplate`
**API Client**: Hono RPC client with type inference (`apps/frontend/src/api/client.ts`)
- Client automatically attaches bearer token to all requests
- Backend types are imported from `@apps/backend` for end-to-end type safety

**Environment Variables**:
Frontend requires (see `apps/frontend/.env.example`):
- `VITE_MSAL_CLIENT_ID` - Entra client ID
- `VITE_MSAL_TENANT_ID` - Entra tenant ID

### Database (Prisma)

**Schema Location**: `packages/db/prisma/schema.prisma`
**Singleton Pattern**: Use `getPrisma()` from `@packages/db` to get Prisma client instance
**Generated Client**: Located at `packages/db/src/generated/prisma/` (excluded from formatting/linting)

**Connection**:
- Uses `@prisma/adapter-pg` with PostgreSQL connection string
- Connection details from environment variables
- Prisma events are logged via Pino logger

**Migrations**:
- Migration files in `packages/db/prisma/migrations/`
- Use `turbo db:migrate:dev` for development (creates new migrations)
- Use `turbo db:migrate:deploy` for production (applies existing migrations)

### Testing

**Framework**: Vitest with globals enabled
**Setup File**: `apps/backend/__tests__/setup.ts`
**Isolation**: Uses `@chax-at/transactional-prisma-testing` for database transaction rollback per test
**Configuration**: `apps/backend/vitest.config.ts` sets LOG_LEVEL to "silent" for cleaner test output

Each test runs in an isolated transaction that rolls back after completion, ensuring tests don't affect each other.

### DevContainer Environment

**Container Services** (`.devcontainer/docker-compose.yml`):
- `dev` - Development container with Node.js 24, Git, GitHub CLI, Turborepo, Claude Code
- `db` - PostgreSQL 15 database

**Forwarded Ports**:
- 5173: Frontend dev server
- 3000: Backend API server
- 5432: PostgreSQL
- 5555: Prisma Studio

**Personal Setup**: Edit `.devcontainer/setup.personal.sh` for personal dotfiles and configurations

## Important Notes

### Package Manager
This project uses **npm** (not pnpm) because DevContainers typically run one codebase per container, eliminating the need for global package caching that pnpm provides.

### Code Style
- **Indentation**: 2 spaces (configured in Biome for better code generation compatibility)
- **Generated Files**: Excluded from formatting/linting: `**/src/generated`, `**/prisma/migrations`
- **Import Organization**: Biome automatically organizes imports on save

### Authentication Scopes
The API scope `api://694b37ed-46b7-422a-aacb-c3ce12277475/All.All` is currently broad (see `apps/frontend/src/auth.tsx:23`). Consider using more fine-grained scopes for production.

### GitHub Authentication

The DevContainer uses GitHub Fine-grained Personal Access Token (not `gh auth login`):

**Setup Steps**:
1. Generate a Fine-grained PAT at https://github.com/settings/personal-access-tokens/new
   - **Expiration**: Set an appropriate value (excluding `No expiration`)
   - **Repository access**: [Only select repositories] - select this repository
   - **Permissions**:
     - [Actions]: Read and write
     - [Contents]: Read and write
     - [Issues]: Read and write
     - [Pull requests]: Read and write
2. Copy `.devcontainer/.env.example` to `.devcontainer/.env`
3. Set the generated token to `GH_TOKEN` in `.devcontainer/.env`
4. Rebuild the Dev Container

**How it works** (`.devcontainer/setup.sh:12-18`):
- On container startup, if `GH_TOKEN` is set, `gh auth setup-git` is automatically executed
- This configures Git to use the token for authentication
- If `GH_TOKEN` is not set, manual authentication will be required for git push/pull
