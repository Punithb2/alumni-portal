# Alumni Portal — Frontend

> **Last updated:** February 21, 2026

A role-aware React SPA for the Alumni Portal. Provides a complete interface for students, alumni and admins — covering networking, job discovery, mentorship, messaging, events, and administration.

---

## Project Status

| Area | Status | Notes |
|---|---|---|
| Authentication (Login / Register) | ✅ Complete | Firebase-backed auth context |
| Role-Based Routing | ✅ Complete | Smart routers redirect per role |
| App Shell / Layout | ✅ Complete | Sidebar + topbar via `ShellLayout` |
| Student Dashboard | ✅ Complete | LinkedIn-style 3-column feed layout |
| Alumni Dashboard | ✅ Complete | Stats + activity feed + quick actions |
| Admin Dashboard | ✅ Complete | KPI stats, verification queue, activity log |
| Alumni Directory | ✅ Complete | Search + filter, profile cards |
| Profile Detail | ✅ Complete | Public profile view |
| Events | ✅ Complete | Event listing with calendar view |
| Chat / Messages | ✅ Complete | Conversation list + message thread |
| Student — Find a Mentor | ✅ Complete | Filter by industry/skills, request modal |
| Student — Job Board | ✅ Complete | Browse / filter / apply |
| Alumni — Mentor Hub | ✅ Complete | Manage mentees and sessions |
| Alumni — Job Board | ✅ Complete | Post + browse jobs |
| Admin — Manage Users | ✅ Complete | User table with approve/suspend |
| Admin — Manage News | ✅ Complete | News CRUD interface |
| Settings | ✅ Complete | Profile & account settings |
| Navigation (role-filtered sidebar) | ✅ Complete | Per-role menu sections |
| Backend API integration | ⏳ Pending | Currently using mock / dummy data |
| Real-time Notifications | ⏳ Pending | Infrastructure in place; not wired |
| Tests | ⏳ Pending | Testing deps installed; no test files yet |

---

## Tech Stack

### Runtime Dependencies

| Package | Version | Role |
|---|---|---|
| React | 19 | UI library |
| react-dom | 19 | DOM renderer |
| react-router-dom | 7 | Client-side routing |
| Vite | 7 | Build tool & dev server |
| Tailwind CSS | 4 | Utility-first styling |
| Lucide React | 0.575 | Icon library |
| Material UI (`@mui/material`) | 7 | Component library (used selectively) |
| `@emotion/react` / `@emotion/styled` | 11 | MUI peer dependencies |
| Recharts | 3 | Charts and data visualisation |
| Axios | 1.13.5 | HTTP client |
| axios-mock-adapter | 2 | API mocking during development |
| notistack | 3 | Toast / snackbar notifications |
| date-fns | 4 | Date formatting utilities |
| lodash | 4 | General utility helpers |
| nanoid | 5 | Unique ID generation |
| clsx | 2 | Conditional className utility |

### Dev / Testing Dependencies

| Package | Purpose |
|---|---|
| Vitest | Test runner |
| `@testing-library/react` | Component rendering |
| `@testing-library/user-event` | User interaction simulation |
| `@testing-library/jest-dom` | Custom DOM matchers |
| `@vitest/coverage-v8` | Code coverage reporting |
| fast-check | Property-based testing |
| ESLint 9 | Linting (`eslint-plugin-react-hooks`, `react-refresh`) |
| Prettier 3 | Code formatting |
| jsdom | DOM environment for tests |

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env   # or create .env manually (see below)

# 3. Start development server
npm run dev
```

App runs at `http://localhost:5173`. Backend (if connected) must run at `http://localhost:8000`.

---

## Environment Variables

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint (zero warnings enforced) |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run format` | Format source files with Prettier |
| `npm run format:check` | Check formatting without writing |
| `npm run test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with V8 coverage report |
| `npm run test:ui` | Open Vitest browser UI |

---

## Project Structure

```
frontend/
├── .env                         # Environment variables (not committed)
├── index.html                   # HTML entry point
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
├── eslint.config.js             # ESLint flat config
├── .prettierrc                  # Prettier rules
└── src/
    ├── main.jsx                 # App entry: mounts <App /> to DOM
    ├── index.css                # Global Tailwind base styles
    └── app/
        ├── App.jsx              # Root: ErrorBoundary + Router Provider
        ├── routes.jsx           # All route definitions (lazy-loaded, role-aware)
        ├── navigations.js       # Role-filtered sidebar navigation sections
        │
        ├── auth/
        │   ├── AuthGuard.jsx    # Redirects unauthenticated users to /login
        │   ├── RoleGuard.jsx    # Blocks access by role; shows 403 fallback
        │   └── authRoles.js     # Role constant definitions (Alumni, Student, Admin, SA)
        │
        ├── components/
        │   ├── Loadable.jsx         # Suspense wrapper for lazy-loaded pages
        │   ├── ErrorBoundary.jsx    # React error boundary with recovery UI
        │   ├── Drawer.jsx           # Generic slide-in drawer component
        │   ├── GenericComponents.jsx  # Shared reusable UI primitives
        │   └── SpecificComponents.jsx # Feature-specific shared components
        │
        ├── contexts/
        │   └── FirebaseAuthContext.jsx  # Auth state, login, register, logout
        │
        ├── hooks/
        │   └── useAuth.js       # Default export: consumes FirebaseAuthContext
        │
        ├── layouts/
        │   └── ShellLayout.jsx  # App shell: sidebar + topbar + <Outlet />
        │
        ├── data/
        │   └── dummyData.js     # Static mock data (profiles, events, news)
        │
        ├── utils/
        │   ├── axios.js         # Axios instance with JWT interceptor
        │   ├── constant.js      # App-wide constants (API paths, role names)
        │   ├── mockData.js      # MOCK_JOBS and other structured mock datasets
        │   └── utils.js         # Utility helpers (formatting, date, etc.)
        │
        └── pages/
            │
            ├── Auth/
            │   └── Auth.jsx             # Login & Register pages (named exports)
            │
            ├── Shared/                  # Role-neutral pages used by all users
            │   ├── Directory.jsx        # Alumni directory with search + filters
            │   ├── ProfileDetail.jsx    # Public profile view
            │   ├── Chat.jsx             # Messaging: conversation list + thread
            │   ├── Events.jsx           # Event listing + calendar
            │   └── Settings.jsx         # Account & profile settings
            │
            ├── Student/                 # Student-only pages
            │   ├── Dashboard.jsx        # LinkedIn-style 3-col feed (feed, widgets, profile card)
            │   ├── FindMentor.jsx       # Mentor search/filter + request modal
            │   └── JobBoard.jsx         # Browse & apply for jobs/internships
            │
            ├── Alumni/                  # Alumni-only pages
            │   ├── Dashboard.jsx        # Stats overview + social post feed
            │   ├── MentorHub.jsx        # Manage mentorship relationships
            │   └── JobBoard.jsx         # Post + manage + browse jobs
            │
            └── Admin/                   # Admin/SA-only pages
                ├── Dashboard.jsx        # KPIs, pending verifications, activity log
                ├── Users.jsx            # User management table (approve/suspend)
                └── News.jsx             # News/announcement CRUD interface
```

> **Note:** The `pages/Dashboard/`, `pages/Events/`, `pages/Chat/`, `pages/Settings/`, and `pages/Profiles/` directories are legacy folders kept for reference. Active routes point exclusively to `pages/Shared/`, `pages/Student/`, `pages/Alumni/`, and `pages/Admin/`.

---

## Routing Architecture

Routes are defined in `src/app/routes.jsx`. All protected routes are wrapped in `<AuthGuard>` and rendered inside `<ShellLayout>`.

### Role-Aware Smart Routers

Three inline router components inspect the logged-in user's role and render the correct page without requiring separate URL paths:

| Router | Path | Alumni renders | Student renders | Admin/SA renders |
|---|---|---|---|---|
| `DashboardRouter` | `/dashboard` | `AlumniDashboard` | `StudentDashboard` | Redirects to `/admin` |
| `MentorsRouter` | `/mentors` | `MentorHub` | `FindMentor` | — |
| `JobsRouter` | `/jobs` | `AlumniJobBoard` | `StudentJobBoard` | — |

### Route Map

| Path | Component | Auth | Roles |
|---|---|---|---|
| `/login` | `Login` | Public | — |
| `/register` | `Register` | Public | — |
| `/dashboard` | `DashboardRouter` | ✅ | All |
| `/directory` | `Directory` | ✅ | All |
| `/profile/:id` | `ProfileDetail` | ✅ | All |
| `/chat` | `Chat` | ✅ | All |
| `/events` | `Events` | ✅ | All |
| `/mentors` | `MentorsRouter` | ✅ | Alumni, Student |
| `/jobs` | `JobsRouter` | ✅ | Alumni, Student |
| `/settings` | `Settings` | ✅ | All |
| `/admin` | `AdminDashboard` | ✅ | Admin, SA |
| `/admin/users` | `AdminUsers` | ✅ | Admin, SA |
| `/admin/news` | `AdminNews` | ✅ | Admin, SA |
| `*` | `NotFound (404)` | — | — |

---

## Navigation (Sidebar)

Defined in `src/app/navigations.js` as `NAV_SECTIONS`. Each section has an optional `auth` array — if set, only users with a matching role see that section. Items without `auth` are visible to all authenticated users.

| Section | Visible to |
|---|---|
| Dashboard | All |
| Network (Directory, Messages, Events) | All |
| Career & Mentorship (Find a Mentor, Job Board) | Student only |
| Mentorship & Career (Mentor Hub, Job Board) | Alumni only |
| Administration (Overview, Users, News, System Settings) | Admin / SA |
| My Account (Settings) | All |

---

## Authentication

Auth state is managed by `FirebaseAuthContext.jsx` (despite the name, it can be wired to any auth provider). It exposes `user`, `login`, `register`, and `logout` via React context.

`useAuth` (default import from `src/app/hooks/useAuth.js`) is the hook used throughout the app to access the current user and their role.

`AuthGuard` — redirects unauthenticated users to `/login`.
`RoleGuard` — accepts an `allowedRoles` prop and shows a 403 message to unauthorised roles.

---

## Testing

```bash
npm run test            # Single run
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage report
npm run test:ui         # Browser-based test UI
```

Test files: `src/**/*.{test,spec}.{js,jsx}`

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Blank screen / crash on dashboard | Check browser console for import errors; ensure `dummyData.js` exports match imports |
| CORS errors | Add `http://localhost:5173` to `CORS_ALLOWED_ORIGINS` in `backend/.env` |
| 401 on every request | Check `VITE_API_BASE_URL` in `.env`; restart `npm run dev` after changes |
| `Module not found` | Run `npm install` to restore packages |
| Stale data after edits | Hard-refresh browser (`Ctrl+Shift+R`) to clear Vite's module cache |

**Port conflict** — Change the port: `npm run dev -- --port 3001`.
