# VYBEBOARD

&lt;div align="center"&gt;
  &lt;h3&gt;Plan less. Ship more. Stay in the VYBE.&lt;/h3&gt;
  &lt;p&gt;A full-stack, real-time collaborative project management platform built with the MERN stack + Socket.IO&lt;/p&gt;

  ![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&amp;logo=node.js&amp;logoColor=white)
  ![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&amp;logo=react&amp;logoColor=black)
  ![MongoDB](https://img.shields.io/badge/MongoDB-6+-47A248?style=flat-square&amp;logo=mongodb&amp;logoColor=white)
  ![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7-010101?style=flat-square&amp;logo=socket.io)
  ![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&amp;logo=vite&amp;logoColor=white)
&lt;/div&gt;

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
5. [Project Structure](#project-structure)
6. [Prerequisites](#prerequisites)
7. [Installation](#installation)
8. [Environment Variables](#environment-variables)
9. [Running Locally](#running-locally)
10. [Seeding Demo Data](#seeding-demo-data)
11. [API Reference](#api-reference)
12. [WebSocket Events](#websocket-events)
13. [Frontend Architecture](#frontend-architecture)
14. [Real-Time Architecture](#real-time-architecture)
15. [Design System](#design-system)
16. [Production Build &amp; Deployment](#production-build--deployment)
17. [Security](#security)
18. [Known Limitations](#known-limitations)

---

## Overview

VYBEBOARD is a production-grade, collaborative project management platform inspired by Linear, Trello, and Asana. It supports real-time Kanban boards, rich task management, team collaboration with role-based access, live WebSocket synchronization across all views (board, analytics, checklists, comments, notifications), command palette, live analytics, and a full SEO-optimized public landing site — all built from scratch as a unified MERN stack application.

---

## Tech Stack

### Backend (`server/`)

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 18+ | JavaScript runtime |
| **Express.js** | 4.19 | HTTP server &amp; REST API |
| **MongoDB** | 6+ | Primary database |
| **Mongoose** | 8.4 | ODM / Schema modeling |
| **Socket.IO** | 4.7 | Real-time bidirectional events |
| **JSON Web Token** | 9.0 | Authentication tokens |
| **bcryptjs** | 2.4 | Password hashing |
| **Zod** | 3.23 | Runtime request validation |
| **Helmet** | 7.1 | Secure HTTP headers |
| **express-rate-limit** | 7.2 | API rate limiting |
| **express-mongo-sanitize** | 2.2 | NoSQL injection prevention |
| **Morgan** | 1.10 | HTTP request logger |
| **cookie-parser** | 1.4 | Cookie parsing middleware |

### Frontend (`client/`)

| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.3 | UI framework |
| **Vite** | 5.2 | Build tool &amp; dev server |
| **Tailwind CSS** | 3.4 | Utility-first CSS framework |
| **React Router DOM** | 6.23 | Client-side routing |
| **TanStack React Query** | 5.45 | Server state management &amp; caching |
| **Axios** | 1.7 | HTTP client with interceptors |
| **Socket.IO Client** | 4.7 | Real-time WebSocket client |
| **@dnd-kit** | 6.1 / 8.0 | Drag-and-drop for Kanban columns &amp; tasks |
| **Framer Motion** | 11.2 | Animations &amp; transitions |
| **Recharts** | 2.12 | Analytics charts |
| **Lucide React** | 0.383 | Icon library |
| **react-helmet-async** | 2.0 | Dynamic `&lt;head&gt;` SEO metadata |

---

## Features

### Authentication &amp; Authorization
- JWT-based auth with `Authorization: Bearer` header and httpOnly cookie support
- Secure signup / login / logout flow
- Forgot password &amp; password reset via tokenized links (tokens stored hashed in DB)
- Change password from account settings
- Role-based access control (RBAC): `owner`, `admin`, `member`, `viewer` — **enforced server-side on every route**

### Project Management
- Create, update, and **delete** projects (owner or admin only)
- **Smart owner assignment at creation:**
  - If `ownerEmail` / `ownerUsername` field is filled → that user becomes **Owner**, creator becomes **Admin**
  - If field is empty → creator is automatically set as **Owner**
- Project-level member directory with invite by email or username
- Role management: change member roles inline; owners cannot be demoted without reassignment
- Remove members from projects with confirmation

### Kanban Board
- Fully configurable columns (default: Backlog → To Do → In Progress → Review → Done)
- Fluid **drag-and-drop** task cards between columns via `@dnd-kit` with **optimistic instant UI updates**
- Task cards show: title, priority badge, assignee avatar, label tags, due date chip, checklist progress bar
- Column task counts dynamically updated in real-time
- Filter tasks by assignee, priority, or label within the board
- `Ctrl+K` global command palette for quick navigation

### Task Management (Rich Task Modal)

**Create Task Modal:**
- Title, description, priority, due date, labels
- Pre-task checklist builder (add/remove items before creation)
- Creator is **automatically set as Assignee** (no manual selector needed at creation)

**Task Detail Modal (RBAC-aware):**
- Assignee shown as a **static badge** (immutable after creation to enforce accountability)
- Admins: edit title, description, priority, due date, labels, add/remove checklist items, delete task
- Members: check/uncheck checklist items only
- All users: comment on tasks
- Real-time checklist progress bar (instant update without modal reload)
- Timestamped comment thread — active user's comments on **left**, others on **right** (WhatsApp-style)
- Copy task link to clipboard
- Delete task with confirmation modal (admin only)
- Live presence indicator ("Sarah is viewing this task")

### My Tasks
- Personal task view across all projects
- Segmented filter tabs: **All / Today / Upcoming / Overdue / Completed** with live count badges
- Mark as Complete / Reopen Task with inline loading feedback

### Team &amp; Workspace Hub
- View all team members across the selected project
- Horizontally scrollable project selector with auto-hiding custom scrollbar
- Role selector inline for each member
- Search members by name or email
- Remove member with confirmation modal
- Add New Team Workspace modal (create new project with owner assignment)

### Analytics — Fully Real-Time
- **Project-level Analytics tab** on the board page (live, same socket room)
- **Global Analytics page** (`/analytics`) — select any project, data updates in real-time via Socket.IO
- Stats: Total Tasks, Completed, In Progress, Overdue, Completion Rate
- Visual charts: **Tasks by Column** (bar chart), **Tasks by Priority** (pie chart)
- **Team Workload Distribution** — task count per assigned team member
- All charts react instantly when tasks are moved, created, or updated (0ms latency via shared React Query cache)

### Notifications — Fully Real-Time
- Real-time delivery via Socket.IO `notification:new` event
- Live bell badge count in topbar — instant in-memory React Query cache update (0ms)
- Auto-reattaches listener on socket reconnect (race condition handled)
- **Notification types:**
  - `task_assigned` — task assigned to you
  - `task_created` — admin created a task in your project (owner receives this)
  - `comment` — someone commented on your task
  - `mention` — someone @mentioned you
  - `member_added` — you were added to a project
  - `project_activity` — general project events
  - `due_date_reminder` — upcoming deadline
- Comment notifications go to: assignee + task creator + project owner (deduplicated)
- Mark individual or all notifications as read

### Global Search
- Full-text search across projects, tasks, and users
- Real-time search results with keyboard navigation
- Accessible via command palette (`Ctrl+K`)

### Settings
- **Account tab:** Edit name, username, bio, avatar initial
- **Appearance tab:** Toggle Dark / Light mode with smooth fade-in transition
- **Notifications tab:** Per-type notification preference toggles
- **Security:** Change password, Delete account (with confirmation modal)

### UI / UX
- **Collapsible sidebar:** Framer Motion smooth 256px→64px animation, icon-only collapsed mode
- **Custom ConfirmModal:** Replaces all native `confirm()` popups with branded danger modals
- **Dark / Light theme:** CSS variable token system, smooth `cubic-bezier` fade transition
- **Responsive layout:** Mobile-friendly with touch scrolling, bottom navigation
- **Skeleton loaders:** Loading states for all data-heavy sections
- **Toast notifications:** Non-blocking success / error alerts

### SEO &amp; Public Site
- Full public marketing site: Landing, Features, Solutions (5 pages), About, Help/FAQ, Contact, Privacy, Terms
- Per-page `&lt;SEO /&gt;` component with unique title, meta description, canonical URL, Open Graph, and Twitter card tags
- JSON-LD structured data: `OrganizationSchema`, `SoftwareApplicationSchema`, `WebSiteSchema`, `FAQSchema`, `BreadcrumbSchema`
- `sitemap.xml` and `robots.txt` in `client/public/`
- All authenticated pages use `noindex`

---

## Role-Based Access Control (RBAC)

| Action | Viewer | Member | Admin | Owner |
|---|---|---|---|---|
| View board &amp; tasks | Yes | Yes | Yes | Yes |
| Comment on tasks | Yes | Yes | Yes | Yes |
| Check checklist items | No | Yes | Yes | Yes |
| Create tasks | No | No | Yes | Yes |
| Edit task fields | No | No | Yes | Yes |
| Delete tasks | No | No | Yes | Yes |
| Manage members | No | No | Yes | Yes |
| Delete project | No | No | Yes | Yes |

Roles are enforced **server-side** on every API route. Client UI only hides controls for UX — the server always validates.

---

## Project Structure

```
vybeboard/
|
|-- server/                          # Express + MongoDB + Socket.IO API
|   |-- config/
|   |   |-- index.js                 # Centralized env config object
|   |   +-- db.js                    # Mongoose connection
|   |-- controllers/
|   |   |-- authController.js        # Signup, login, logout, profile, password reset
|   |   |-- projectController.js     # CRUD projects, members, roles, owner assignment
|   |   |-- taskController.js        # CRUD tasks, move columns, checklist, notifications
|   |   |-- commentController.js     # Comments with @mention + multi-recipient notifications
|   |   |-- notificationController.js
|   |   +-- searchController.js
|   |-- middleware/
|   |   |-- authMiddleware.js
|   |   |-- authorizeProjectRole.js
|   |   |-- errorHandler.js
|   |   |-- notFound.js
|   |   |-- rateLimiter.js
|   |   +-- validate.js
|   |-- models/
|   |   |-- User.js
|   |   |-- Project.js               # members[{user,role}], owner
|   |   |-- Task.js                  # checklist[], assignee, labels, dueDate
|   |   |-- Comment.js               # mentions[]
|   |   |-- Notification.js          # type enum: task_assigned, task_created, comment, mention...
|   |   +-- Activity.js
|   |-- routes/
|   |   |-- authRoutes.js
|   |   |-- projectRoutes.js
|   |   |-- taskRoutes.js
|   |   |-- commentRoutes.js
|   |   |-- notificationRoutes.js
|   |   |-- searchRoutes.js
|   |   +-- index.js
|   |-- sockets/
|   |   +-- index.js                 # Socket.IO init, JWT auth, room join/leave, event relay
|   |-- seed/
|   |   +-- seed.js
|   |-- utils/
|   |   |-- asyncHandler.js
|   |   |-- apiResponse.js
|   |   +-- tokens.js
|   |-- validators/
|   |   |-- authValidators.js
|   |   |-- taskValidators.js        # includes checklist[] schema
|   |   +-- projectValidators.js
|   |-- .env.example
|   |-- package.json
|   +-- server.js
|
+-- client/                          # React 18 + Vite + Tailwind CSS SPA
    |-- public/
    |   |-- favicon.svg
    |   |-- robots.txt
    |   +-- sitemap.xml
    +-- src/
        |-- App.jsx
        |-- main.jsx
        |-- index.css                # CSS variables (Neon Orbit tokens), global styles
        |-- components/
        |   |-- CommandPalette.jsx
        |   |-- ProtectedRoute.jsx
        |   |-- layout/
        |   |   |-- AppLayout.jsx
        |   |   |-- Sidebar.jsx
        |   |   |-- Topbar.jsx       # Live notification bell badge
        |   |   +-- MobileNav.jsx
        |   |-- seo/
        |   |   |-- SEO.jsx
        |   |   +-- StructuredData.jsx
        |   +-- ui/
        |       |-- Avatar.jsx
        |       |-- Badge.jsx
        |       |-- Button.jsx
        |       |-- Card.jsx
        |       |-- ConfirmModal.jsx
        |       |-- EmptyState.jsx
        |       |-- Input.jsx
        |       |-- Modal.jsx
        |       +-- Skeleton.jsx
        |-- context/
        |   |-- AuthContext.jsx      # login/logout + socket connect
        |   |-- ThemeContext.jsx
        |   +-- ToastContext.jsx
        |-- features/board/
        |   |-- Column.jsx
        |   |-- TaskCard.jsx         # checklist progress bar, priority, labels
        |   |-- TaskModal.jsx        # RBAC modal: checklist, WhatsApp-style comments
        |   +-- CreateTaskModal.jsx  # pre-task checklist builder, auto-assignee
        |-- hooks/
        |   |-- useProjects.js
        |   |-- useTasks.js          # optimistic updates for update + move
        |   |-- useComments.js
        |   |-- useNotifications.js
        |   |-- useSocketBoard.js    # 0ms cache patch for all task socket events
        |   +-- useSocketNotifications.js  # reconnect-safe notification listener
        |-- lib/
        |   |-- apiClient.js
        |   |-- socket.js
        |   +-- queryClient.js
        +-- pages/
            |-- public/              # Landing, Features, Solutions, About, Help, Contact, Privacy, Terms
            |-- auth/                # Login, Signup, ForgotPassword, ResetPassword
            +-- app/
                |-- Dashboard.jsx
                |-- Projects.jsx
                |-- ProjectBoard.jsx # Kanban board + Analytics tab + Members tab
                |-- MyTasks.jsx
                |-- Team.jsx
                |-- Analytics.jsx    # Real-time: column chart, priority pie, team workload
                |-- Notifications.jsx
                +-- Settings.jsx
```

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **MongoDB** v6+ (local or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier)
- Two terminal tabs — one for `server/`, one for `client/`

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/&lt;your-username&gt;/vybeboard.git
cd vybeboard

# 2. Install server dependencies
cd server
npm install

# 3. Install client dependencies
cd ../client
npm install
```

---

## Environment Variables

### Server — `server/.env`

```bash
cp server/.env.example server/.env
```

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

MONGO_URI=mongodb://127.0.0.1:27017/vybeboard

JWT_SECRET=replace_this_with_a_very_long_random_secret_string
JWT_EXPIRES_IN=7d
RESET_TOKEN_EXPIRES_MINUTES=30

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300
```

### Client — `client/.env`

```bash
cp client/.env.example client/.env
```

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_SITE_URL=http://localhost:5173
```

Note: Vite exposes only variables prefixed with `VITE_` to the browser bundle.

---

## Running Locally

Open **two terminal tabs:**

**Terminal 1 — Backend:**
```bash
cd server
npm run dev       # nodemon (auto-restarts on file change)
```
API health check: http://localhost:5000/api/health

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```
App: http://localhost:5173

---

## Seeding Demo Data

```bash
cd server
npm run seed
```

Warning: The seed script **drops existing data** before inserting. Only run on a fresh or development database.

### Demo Credentials

All seed users share the password `vybeboard123`:

| Name | Email |
|---|---|
| Alex Rivera (Primary) | alex@vybeboard.dev |
| Sarah Chen | sarah@vybeboard.dev |
| Ahmed Hassan | ahmed@vybeboard.dev |
| Maya Patel | maya@vybeboard.dev |
| Jordan Kim | jordan@vybeboard.dev |

---

## API Reference

All routes are prefixed with `/api`. Protected routes require `Authorization: Bearer &lt;token&gt;` header.

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /signup | No | Register new user |
| POST | /login | No | Login, returns JWT |
| POST | /logout | Yes | Clear session |
| GET | /me | Yes | Get current user profile |
| PUT | /profile | Yes | Update name, username, bio, preferences |
| PUT | /password | Yes | Change password |
| POST | /forgot-password | No | Request reset token |
| POST | /reset-password | No | Reset password with token |
| DELETE | /account | Yes | Permanently delete account |

### Projects — `/api/projects`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | / | Yes | List all projects user is a member of |
| POST | / | Yes | Create project (with optional owner field) |
| GET | /:id | Yes Member | Get project details |
| PUT | /:id | Yes Admin | Update project metadata |
| DELETE | /:id | Yes Owner/Admin | Delete project |
| POST | /:id/members | Yes Admin | Add member by email or username |
| PATCH | /:id/members/:userId/role | Yes Admin | Change member role |
| DELETE | /:id/members/:userId | Yes Admin | Remove member |
| GET | /:id/activity | Yes Member | Project activity log |

### Tasks

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /projects/:id/tasks | Yes Member | List tasks (filter: status, assignee, priority, label) |
| POST | /projects/:id/tasks | Yes Admin | Create task (checklist[], assignee auto-set to creator) |
| GET | /tasks/:id | Yes Member | Get single task |
| PUT | /tasks/:id | Yes Admin | Update task fields |
| PATCH | /tasks/:id/move | Yes Member | Move task to different column |
| DELETE | /tasks/:id | Yes Admin | Delete task |

### Comments — `/api/tasks/:taskId/comments`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | / | Yes Member | List comments for a task |
| POST | / | Yes Member | Post comment (notifies assignee + creator + owner) |
| PUT | /:id | Yes Author | Edit own comment |
| DELETE | /:id | Yes Author | Delete own comment |

### Notifications — `/api/notifications`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | / | Yes | List notifications for current user |
| PATCH | /:id/read | Yes | Mark one notification as read |
| PATCH | /read-all | Yes | Mark all as read |

### Search — `/api/search`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /?q=&lt;query&gt; | Yes | Full-text search across tasks, projects, users |

---

## WebSocket Events

Every Socket.IO connection is authenticated with the same JWT used for REST. Clients join a `project:&lt;id&gt;` room only after server-side membership verification.

### Client to Server

| Event | Payload | Description |
|---|---|---|
| project:join | projectId | Join a project room (verified server-side) |
| project:leave | projectId | Leave a project room |
| task:viewing | { taskId, projectId } | Broadcast presence indicator |

### Server to Client

| Event | Target | Payload | Description |
|---|---|---|---|
| task:created | Project room | task | New task — instantly added to board and analytics |
| task:updated | Project room | task | Task updated — instant card and modal refresh |
| task:moved | Project room | task | Task moved — instant drag feedback |
| task:deleted | Project room | { id } | Task removed from board instantly |
| comment:new | Project room | { taskId, comment } | New comment on any task in the project |
| notification:new | User room | notification | Bell badge updates instantly |
| task:presence | Project room | { taskId, user } | Presence indicator update |

---

## Frontend Architecture

### State Management

- **Server state:** TanStack React Query — all API data fetched, cached, and invalidated via custom hooks in `src/hooks/`
- **Real-time state:** Socket.IO events directly mutate React Query in-memory cache (`setQueriesData`) for 0ms latency
- **Auth state:** `AuthContext` — persisted to `localStorage`, auto-hydrated on app load
- **Theme state:** `ThemeContext` — dark/light toggle, persisted to `localStorage`
- **Toast state:** `ToastContext` — global notification queue

---

## Real-Time Architecture

### 0ms Latency Strategy

All mutations use a two-phase approach:

1. **Optimistic update** — `onMutate` in React Query immediately patches the in-memory cache (`setQueriesData`) using the local payload, so the UI reflects the change before the network round-trip completes.
2. **Socket confirmation** — Server broadcasts the confirmed task via Socket.IO; `useSocketBoard` applies the server-authoritative version to the cache, and a background `invalidateQueries` fetches fresh data to reconcile.

```
User action (checkbox tick / drag-drop)
    |
    v
onMutate: setQueriesData (instant 0ms)
    |
    v
HTTP PATCH -- Server -- DB save
    |
    v
Socket.IO broadcast -- useSocketBoard -- setQueriesData
    |
    v
invalidateQueries (background refresh)
```

### Notification Reliability

`useSocketNotifications` handles the common race condition where the socket is not yet connected when the hook mounts:
- Tries to attach `notification:new` listener immediately
- Falls back to a 300ms polling interval until `getSocket()` is truthy
- Re-attaches on every `connect` event to handle reconnections

### Analytics Real-Time Sync

The global Analytics page (`/analytics`) and the project-level Analytics tab both:
- Use the **same unified `useTasks` cache** as the Kanban board
- Subscribe to `useSocketBoard` — so any task create/move/delete on the board is **instantly reflected in charts** with no extra API call

---

## Design System

### Neon Orbit Theme

| Token | Dark | Light | Usage |
|---|---|---|---|
| --color-canvas | #0d0f14 | #f6f5f0 | Page background |
| --color-surface | #13161d | #ffffff | Card background |
| --color-elevated | #1a1e28 | #f0eee8 | Elevated surfaces |
| --color-brand | #6D5DFB | #6D5DFB | Primary action / accent |
| --color-ink | #e8e6f0 | #1a1a2e | Primary text |
| --color-ink-secondary | #8a86a0 | #6b6880 | Secondary text |
| --color-border-c | #252836 | #d8d5cc | Borders |
| --color-danger | #f43f5e | #e11d48 | Destructive actions |
| --color-success | #22c55e | #16a34a | Positive states |

### Typography
- **Headings:** Space Grotesk (Google Fonts)
- **Body:** Inter (Google Fonts)
- **Monospace/labels:** JetBrains Mono (Google Fonts)

---

## Production Build &amp; Deployment

### Build

```bash
cd client
npm run build
# Output: client/dist/
```

### Deployment Options

**Option A — Separate Hosts (Recommended)**

| Layer | Recommended Hosts |
|---|---|
| Frontend (client/dist) | Vercel, Netlify, Cloudflare Pages |
| Backend (server/) | Render, Railway, Fly.io, DigitalOcean App Platform |
| Database | MongoDB Atlas (free M0 cluster) |

Production environment variables:
- Backend: `NODE_ENV=production`, `CLIENT_URL=https://your-frontend.com`, strong `JWT_SECRET`
- Frontend: `VITE_API_URL=https://your-backend.com/api`, `VITE_SOCKET_URL=https://your-backend.com`

**Option B — Unified Single Server**

Add to `server/server.js` after API routes:

```js
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.join(__dirname, '../client/dist');

app.use(express.static(clientDist));
app.get('*', (req, res, next) =&gt; {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next();
  res.sendFile(path.join(clientDist, 'index.html'));
});
```

### Push to GitHub

```bash
git init
git add .
git commit -m "feat: VYBEBOARD full-stack project management platform"
git branch -M main
git remote add origin https://github.com/&lt;your-username&gt;/&lt;repo-name&gt;.git
git push -u origin main
```

---

## Security

| Area | Implementation |
|---|---|
| Password storage | bcryptjs with salt rounds = 10 |
| Authentication | JWT (Bearer header + httpOnly cookie) |
| Authorization | Server-side RBAC via authorizeProjectRole middleware |
| NoSQL injection | express-mongo-sanitize on all request bodies |
| HTTP headers | helmet (HSTS, X-Frame-Options, CSP, etc.) |
| Rate limiting | express-rate-limit — 300 req/15min general, tighter on /auth |
| Input validation | Zod schemas on all mutating routes (including checklist arrays) |
| Socket auth | Every Socket.IO connection verified with same JWT as REST |
| Project rooms | Server verifies membership before allowing room join |
| Reset tokens | Random, SHA-256 hashed before DB storage, 30-min TTL |
| Error responses | Stack traces stripped in NODE_ENV=production |

---

## Known Limitations

| Feature | Current Status |
|---|---|
| Email delivery | Reset tokens and notifications logged to console. Integrate SendGrid / Postmark / Resend for real email. |
| File attachments | Schema ready but UI upload not implemented. Add Multer + S3/Cloudinary. |
| SSR / Prerendering | App is a client-side SPA. For max SEO crawlability, add Vite SSR or switch to Next.js. |
| Refresh token rotation | Single long-lived JWT. Add refresh token rotation for production auth hardening. |
| Pagination | All list queries return full results. Add cursor-based pagination for large datasets. |
| Test suite | No automated tests. Add Vitest (unit) + Supertest (API) + Playwright (E2E). |
| Email verification | Signup does not require email verification. Add OTP or magic-link flow. |

---

## License

MIT &copy; VYBEBOARD — Built for the Code Alpha Internship Program.
