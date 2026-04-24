# AGENTS.md

## Commands

- `npm run dev` — dev server (Vite with HMR)
- `npm run build` — production build
- `npm run lint` — ESLint (no typecheck step; this is plain JS, not TypeScript)
- No test runner or test framework is configured. Do not attempt to run tests.

## Verification order

`npm run lint` → `npm run build`

## Architecture

Offline-first task management PWA. Data is written to IndexedDB immediately and synced to Supabase in the background.

- `src/main.jsx` — entry point
- `src/App.jsx` — root component, orchestrates auth/sync/UI state
- `src/lib/supabase.js` — Supabase client (hardcoded public anon key)
- `src/lib/db.js` — IndexedDB wrapper (via `idb`)
- `src/lib/local-store.js` — CRUD against IndexedDB (source of truth for UI)
- `src/lib/sync.js` — bidirectional sync engine (push dirty local → Supabase, pull remote → merge)
- `src/components/` — UI components (Auth, TaskForm, TaskList, FilterBar, Stats, ConnectionStatus, ThemePicker, TaskItem)
- `supabase/schema.sql` — database schema with RLS policy; apply changes via Supabase SQL Editor

## Key patterns

- Tasks are marked `dirty: true` on local mutation and synced to Supabase with a 2-second debounce (`schedulePush` in App.jsx).
- Remote pull preserves locally dirty records over remote versions.
- Soft delete: tasks get `deleted: true` locally, then purged from Supabase on next push.
- Per-user data is partitioned by `user_id` (RLS enforced server-side, IndexedDB indexed on `user_id`).

## Quirks

- **JSX, not TypeScript.** `@types/react` is in devDeps for editor hints only.
- ESLint `no-unused-vars` ignores variables matching `^[A-Z_]`.
- `.npmrc` requires `legacy-peer-deps=true`.
- PWA configured via `vite-plugin-pwa` (service worker + runtime caching for Google Fonts).
