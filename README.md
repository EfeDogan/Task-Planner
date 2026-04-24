# Task Planner

Offline-first task management PWA. Organize your day, achieve your goals.

## Features

- **Guest mode** — start using the app instantly, no account required
- **Offline-first** — works without internet; tasks sync to the cloud when back online
- **Cloud sync** — sign in with email to sync tasks across devices via Supabase
- **Custom categories** — create, rename, and color-code categories to match your workflow
- **Priority levels** — mark tasks as Low, Medium, or High priority
- **Due dates & times** — set deadlines with overdue and "due soon" indicators
- **Dashboard stats** — total, pending, done, and progress at a glance
- **Filter & search** — filter by category, priority, status, or free-text search
- **Multiple themes** — Default, Dark, Ocean, Forest, Vanilla
- **PWA** — installable on mobile and desktop with full offline support

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 19, Lucide icons |
| Build | Vite 8 |
| Local storage | IndexedDB via [idb](https://github.com/jakearchibald/idb) |
| Auth & sync | [Supabase](https://supabase.com) |
| PWA | [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Workbox) |
| Linting | ESLint 9 flat config |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Supabase Setup (optional — needed for cloud sync)

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the Supabase SQL Editor
3. Update `src/lib/supabase.js` with your project URL and anon key

The app works fully without Supabase in guest mode (local-only).

## Architecture

```
src/
├── main.jsx                  # Entry point
├── App.jsx                   # Root component — auth, sync, state
├── App.css                   # All styles
├── lib/
│   ├── supabase.js           # Supabase client
│   ├── db.js                 # IndexedDB wrapper (idb)
│   ├── local-store.js        # CRUD operations against IndexedDB
│   └── sync.js               # Bidirectional sync engine
└── components/
    ├── Auth.jsx              # Sign in / Sign up / Guest
    ├── TaskForm.jsx          # Add new tasks
    ├── TaskItem.jsx          # Single task with inline editing
    ├── TaskList.jsx          # Grouped task display by category
    ├── FilterBar.jsx         # Search & filter controls
    ├── Stats.jsx             # Dashboard statistics
    ├── ConnectionStatus.jsx  # Offline / syncing banner
    └── ThemePicker.jsx       # Theme switcher

supabase/
└── schema.sql                # Database schema with RLS
```

### Sync Flow

1. Every local mutation marks the task as `dirty: true` in IndexedDB
2. A 2-second debounced push sends dirty records to Supabase
3. Remote pulls preserve locally dirty records over remote versions
4. Deletes are soft — marked `deleted: true` locally, then purged on push
5. Guest users skip all sync — data stays in IndexedDB only

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build locally |

## License

MIT
