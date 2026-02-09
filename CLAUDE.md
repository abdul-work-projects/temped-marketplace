# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TempEd is a two-sided marketplace MVP connecting teachers with schools for short-term teaching placements in South Africa. It uses mock data with localStorage persistence (no real backend/database).

## Commands

```bash
npm run dev        # Start dev server at localhost:3000
npm run build      # Production build
npm start          # Serve production build
npm run lint       # ESLint
```

## Tech Stack

- **Next.js 16** (App Router) with React 19 and TypeScript (strict mode)
- **Tailwind CSS 4** for styling (utility classes, no CSS modules)
- **Lucide React** for icons
- **date-fns** for date formatting
- **react-hook-form** + **zod** for form handling/validation
- Path alias: `@/*` maps to project root

## Architecture

### State Management

All state is managed through two React Context providers (wrapped in `app/layout.tsx`):

- **AuthContext** (`lib/context/AuthContext.tsx`): Login/signup/logout, persists auth to localStorage. Mock authentication — any password works with demo emails.
- **DataContext** (`lib/context/DataContext.tsx`): All app data (teachers, schools, jobs, applications). Loads mock data from `lib/data/mockData.ts` on first run, then persists to localStorage. Provides mutation methods (updateTeacher, createJob, applyToJob, etc.).

All pages use `'use client'` directive — the app is fully client-rendered.

### Routing (Two User Types)

Routes are split by user type with parallel feature sets:

- `/auth/login`, `/auth/signup` — authentication
- `/teacher/*` — dashboard, setup, profile, applications, jobs/[jobId], schools/[schoolId]
- `/school/*` — dashboard, setup, profile, post-job, active, jobs/[jobId]/applicants, teachers/[teacherId]
- `/` — redirects to login or appropriate dashboard based on auth state

### Shared Components (`components/shared/`)

- **DashboardLayout** — wraps all authenticated pages, enforces user type access
- **Sidebar** — navigation sidebar with teacher/school variants
- **JobCard** — reusable job listing card with distance display
- **Footer** — page footer

### Type System (`types/index.ts`)

Core types: `User`, `Teacher`, `School`, `Job`, `Application`, `Review`, `Experience`, `Document`. Union types for `UserType`, `EducationPhase`, `SchoolType`, `Curriculum`, `JobStatus`.

### Theme Colors (defined in `globals.css`)

- Primary: `#a435f0` (purple), Secondary: `#5624d0`, Accent: `#e34444` (red)

### Utilities

- `lib/utils/distance.ts` — Haversine formula for teacher-to-school distance calculation

## Demo Accounts

Teachers: `sarah.johnson@gmail.com`, `michael.peters@gmail.com`, `thandi.mkhize@gmail.com`
Schools: `greenvalley@school.za`, `sunnyside@school.za`, `capetown.high@school.za`
Password: anything works (mock auth)
