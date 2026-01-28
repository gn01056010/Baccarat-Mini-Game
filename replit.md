# Baccarat Casino Game

## Overview

This is a real-time Baccarat casino game simulation built as a full-stack web application. The project features an interactive card game interface with betting mechanics, roadmap tracking (Bead Plate, Big Road, Big Eye Boy, Small Road, Cockroach Road), and persistent game state. Players can place bets on Player, Banker, Tie, or pair outcomes, with the game engine handling standard Baccarat rules including third-card drawing logic.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state and caching
- **Styling**: Tailwind CSS with CSS variables for theming (casino green/gold palette)
- **UI Components**: shadcn/ui component library (New York style) built on Radix UI primitives
- **Animations**: Framer Motion for card dealing and chip interactions
- **Build Tool**: Vite with path aliases (`@/` for client/src, `@shared/` for shared code)

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints defined in `@shared/routes.ts` with Zod validation schemas
- **Game Engine**: Server-side Baccarat logic in `server/routes.ts` including:
  - 8-deck shoe management with Fisher-Yates shuffle
  - Standard Baccarat scoring (face cards = 0, Ace = 1)
  - Third-card drawing rules
  - Roadmap generation algorithms

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` (shared between frontend and backend)
- **Database Tables**:
  - `users`: Player accounts with chip balances
  - `shoes`: Game sessions tracking deck count and remaining cards
  - `hands`: Round history stored as JSONB for roadmap reconstruction
- **Migrations**: Drizzle Kit with `db:push` command

### Shared Code Pattern
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts`: Database schema, TypeScript types for cards, hands, bets, and roadmaps
- `routes.ts`: API endpoint definitions with Zod schemas for request/response validation

### Build System
- **Development**: Vite dev server with HMR, proxied through Express
- **Production**: 
  - Frontend: Vite builds to `dist/public`
  - Backend: esbuild bundles server to `dist/index.cjs` with selective dependency bundling
- **Script**: Custom `script/build.ts` handles both builds

## External Dependencies

### Database
- **PostgreSQL**: Primary data store via `DATABASE_URL` environment variable
- **Connection**: `pg` (node-postgres) with connection pooling
- **Session Store**: `connect-pg-simple` for session persistence

### Key Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **framer-motion**: Animation library for card/chip effects
- **wouter**: Minimal React routing
- **date-fns**: Date formatting utilities
- **lucide-react**: Icon library

### Key Backend Libraries
- **express**: HTTP server framework (v5)
- **drizzle-orm** / **drizzle-kit**: Database ORM and migration tooling
- **zod** / **drizzle-zod**: Schema validation and type inference
- **nanoid**: Unique ID generation

### UI Framework
- **shadcn/ui**: Pre-built accessible components via Radix UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management