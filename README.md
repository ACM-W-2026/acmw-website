# SSN ACM-W Student Chapter

The website for the SSN ACM-W Student Chapter, migrated to Next.js App Router with scroll-driven historical timeline, 3D turned obsidian codex scroll, terminal decision fork, and organic living butterfly mosaic.

## Stack

- **Framework**: Next.js 16 App Router with React 19 and Server/Client Components
- **Styling**: Tailwind CSS 4 with canonical 6-color design system
- **Motion & Canvas**: GSAP, Pretext text measurement, HTML5 Canvas
- **Icons**: Lucide React
- **Testing**: Vitest 5, React Testing Library, JSDOM, Playwright E2E browser acceptance
- **Package Manager**: npm with locked dependencies

## Getting started

Requires Node.js 20.9 or later (Node.js 26 Active LTS recommended for CI and full test suite).

```bash
npm ci
npm run dev
```

Open http://localhost:3000.

### Verification & Testing

```bash
# Linting & Typecheck
npm run lint
npx tsc --noEmit

# Unit & Component Tests
npm run test:unit

# Production Build
npm run build

# Gated Asset Build Security Verification
npm run test:gated

# Playwright Browser Acceptance Smoke Suite
npm run test:e2e
```

## Structure

- `src/app/` — Canonical 8-route Next.js App Router pages
  - `page.tsx` — Root darkness-first timeline and terminal decision fork (`/`)
  - `home/page.tsx` — Living Mosaic homepage (`/home`)
  - `about/page.tsx` — The Genesis & Heritage (`/about`)
  - `events/page.tsx` — Flagship Initiatives (`/events`)
  - `projects/page.tsx` — Technical Ecosystem (`/projects`)
  - `outreach/page.tsx` — Community Empowerment (`/outreach`)
  - `team/page.tsx` — Leadership & Guidance (`/team`)
  - `join-us/page.tsx` — The Open Horizon (`/join-us`)
- `src/components/` — Migrated interactive components (`timeline`, `fork`, `mosaic`, `atmosphere`, `layout`, `pages`)
- `src/data/` — Canonical chapter records, facet definitions, and approved historical milestones
- `tests/website/` — Curated unit tests, validation support schemas, and Playwright smoke suite
