# City Climate Action Tracker

Phase 1 implementation for the OEF City Climate Action Tracker exercise. The app uses Next.js App Router, React, TypeScript, Tailwind CSS, and Zod with Greenville sample data loaded from in-memory fixtures.

## Prerequisites

- Node.js 20 or newer
- npm

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

- Public Viewer: [http://localhost:3000](http://localhost:3000)
- City Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

## Scripts

```bash
npm run dev
npm run build
npm run start
```

## Phase 1 Scope

- Public dashboard shell with Greenville metrics and sector breakdown.
- Admin shell with baseline, target year, action table, and disabled future workflow buttons.
- Open Earth / CityCatalyst visual tokens mapped through Tailwind.

Persistence, PostgreSQL migrations, LLM import, CRUD, auth, charts, and tests are deferred to later sprints.
