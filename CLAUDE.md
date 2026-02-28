# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Package Manager**: Always use `pnpm` (configured as packageManager in package.json)
- **Development**: `pnpm dev` (runs Next.js with Turbopack)
- **Build**: `pnpm build`
- **Linting**: `pnpm lint` (Biome with Ultracite.ai configuration)
- **Formatting**: `pnpm lint:fix` (Biome check and format with auto-fix)
- **Format Only**: `pnpm format` (Biome format without linting)
- **Type Checking**: `pnpm typecheck` (TypeScript compiler check)
- **Testing**: No test framework configured (check with user before implementing)

### Database Commands
- **Generate**: `pnpm db:generate` (Prisma migrate dev)
- **Deploy**: `pnpm db:migrate` (Prisma migrate deploy)  
- **Push**: `pnpm db:push` (Direct schema push)
- **Studio**: `pnpm db:studio` (Prisma Studio GUI)

## Architecture Overview

This is a fullstack T3 Stack application built with:

### Core Technologies
- **Next.js 15** with App Router (TypeScript)
- **tRPC 11** for end-to-end type safety
- **Prisma** with PostgreSQL (dual Prisma + Drizzle generators)
- **Tailwind CSS v4** with custom PostCSS config
- **React 19** with modern hooks

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── (protected)/       # Route groups for auth-protected pages
│   └── api/trpc/          # tRPC API endpoint
├── server/                 # Backend logic
│   ├── routers/           # tRPC routers organized by domain
│   ├── config/            # tRPC and server configuration
│   ├── auth/              # Authentication utilities
│   └── domain/            # Business logic (logger, etc.)
├── interface/              # Frontend components and utilities
│   ├── components/        # Reusable UI components
│   ├── features/          # Feature-specific components
│   ├── hooks/             # Custom React hooks
│   └── utils/             # Frontend utilities
├── common/                 # Shared utilities (auth-edge, etc.)
├── config/                 # App configuration (env, routes)
└── middleware.ts           # Route protection and auth middleware
```

### Authentication & Authorization
- **JWT-based** with access/refresh token pattern
- **Role-based access control** (ADMIN, MANAGER, MEMBER)
- **Route protection** via middleware with role checking
- **Edge-compatible** auth validation for middleware
- **Cookie-based** token storage with security headers

### Key Patterns

#### tRPC Router Organization
- Routers organized by domain in `src/server/routers/`
- Each router has methods split into separate files
- Repository pattern for database operations
- Procedures are typed (public/protected) via `procedures` config

#### Route Protection
- Public routes defined in `config/route-control.ts`
- Route permissions mapped by role in same file
- Middleware handles auth validation and redirects
- Protected routes under `app/(protected)/` route group

#### Database Schema
- PostgreSQL with Prisma ORM
- User roles enum (ADMIN, MANAGER, MEMBER)
- Session management with IP tracking and user agent
- Verification codes for email confirmation
- Dual generator setup (Prisma + Drizzle)

#### Frontend Architecture
- Components split between `interface/components/` (reusable) and `interface/features/` (domain-specific)
- Custom hooks in `interface/hooks/`
- Form handling with React Hook Form + Zod validation
- State management via tRPC React Query

## Important Configuration Details

### TypeScript Config
- Strict mode enabled with `strictNullChecks` and `noUncheckedIndexedAccess`
- Path aliases: `@/*` → `./src/*`, `@auth` → `./src/server/auth`
- ES2022 target with bundler module resolution

### Code Quality Tools
- **Biome**: Fast linter and formatter (replaces ESLint + Prettier)
- **Ultracite.ai**: Enhanced configuration extending Biome with best practices
- **Configuration**: `biome.jsonc` with `"extends": ["ultracite"]`
- **VS Code Integration**: Auto-format on save with import organization
- **Pre-commit**: lint-staged runs Biome check on staged files

### Environment Setup
- Requires Node.js >= 22.10.0 and pnpm >= 10.6.5
- PostgreSQL 17 database (check Docker setup)
- Environment variables in `.env` (copy from `.env.example`)

## Development Workflow

### Before Starting
1. Verify PostgreSQL 17 is running
2. Copy `.env.example` to `.env` and configure
3. Run `pnpm install`
4. Run `pnpm db:generate` for initial migration
5. Always implement one feature at a time

### Code Style Requirements
- Use `pnpm` for all package operations
- Run `pnpm lint:fix` before commits to ensure code consistency
- Follow existing patterns in router organization
- Implement proper error handling and validation
- Use TypeScript strict typing throughout
- Follow the established folder structure
- Biome handles formatting, import sorting, and basic linting automatically

### Security Notes
- Security headers applied via middleware
- HTTPS redirect in production
- HttpOnly cookies for tokens
- CSRF protection via SameSite cookies
- IP address and user agent tracking in sessions

## Business Rules Reference
Refer to `.project-business-rules.md` for detailed business logic and validation rules that must be followed when implementing features.

## GitHub Copilot Instructions
This project includes comprehensive development instructions in `.github/copilot-instructions.md` with detailed documentation links covering initialization protocols, route control, TypeScript rules, and UI components.