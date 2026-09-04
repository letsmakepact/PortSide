# Portside

> Give every local dev server a clean `*.localhost` address. Stop remembering ports.

Portside is a local development reverse proxy and management dashboard that maps subdomains (like `api.localhost` or `shop.localhost`) directly to your internal local ports (like `:8081` or `:3000`) without editing `/etc/hosts` or installing custom certificate authorities.

Created by **pact** ([@letsmakepact](https://github.com/letsmakepact) · Telegram: [@pactwithdevil](https://t.me/pactwithdevil)).

---

## Key Features

- **Clean `*.localhost` Hostnames on Port 80:** Modern browsers resolve `*.localhost` locally out of the box. Run on Port 80 for pure URLs (`http://api.localhost/`) with zero port suffixes.
- **Interactive Feature Tour:** Built-in interactive onboarding guide that demonstrates every feature step-by-step for first-time users.
- **Automatic GitHub Update Tracking:**
  - **Standalone Windows Launcher (`.exe`):** Checks GitHub for newer releases on every launch and sets up Docker, dependencies, and database migrations automatically.
  - **In-App Update Notifier:** Automatically alerts users running on localhost when an update is published on GitHub, showing changelogs and offering 1-click `.exe` download or `git pull` guidance.
- **Live Background Socket Monitor:** Continuously probes your registered services, measures real-time latency, and flags servers as online or offline.
- **Pin & Pause Controls:** Pin high-frequency services to the top of the dashboard, or temporarily pause routes to display a clean custom explainer page instead of connection errors.
- **Projects & Tags:** Organize your microservices into color-coded groups (e.g., Frontend, Backend, Data, Side Projects).
- **Reverse Proxy Header & Redirect Rewriting:** Automatically rewrites upstream `Host` and redirect `Location` headers back to your clean `*.localhost` domain.
- **Activity Feed & Audit Log:** Full audit log tracking every registered route, port update, and status change.

---

## Getting Started

### Option A: Standalone Windows Launcher (Recommended)

If you don't want to deal with terminal commands, Docker setup, and manual updates:

1. Download **`Portside-Launcher.exe`** from [Latest Releases](https://github.com/letsmakepact/PortSide/releases/latest).
2. Double-click to run:
   - Checks GitHub for new releases automatically.
   - Spins up PostgreSQL via Docker if not already running.
   - Verifies dependencies and syncs database tables.
   - Binds Portside to **Port 80** and opens `http://localhost` in your browser.

---

### Option B: Manual Localhost Setup

#### 1. Clone & Install Dependencies

```bash
git clone https://github.com/letsmakepact/PortSide.git
cd PortSide
npm install
```

#### 2. Configure Environment

Copy the default environment file:

```bash
cp .env.example .env
```

Ensure `.env` is configured for Port 80 (default):

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/portside_db
PORT=80
```

#### 3. Start PostgreSQL

Start the database with Docker Compose:

```bash
docker compose up -d
```

#### 4. Push Database Schema

```bash
npm run db:push
```

#### 5. Launch the Server

```bash
npm run dev
```

Open [http://localhost](http://localhost) in your browser.

**Default Login:**
- **Email:** `demo@portside.dev`
- **Password:** `demo1234`

---

## How Routing Works

1. Modern browsers (Chrome, Firefox, Brave, Edge) automatically resolve any `*.localhost` domain to `127.0.0.1`.
2. Portside listens on Port 80. When a request arrives for `http://api.localhost/`:
   - Portside inspects the host header (`api`).
   - Looks up the assigned port (e.g., `8081`) from PostgreSQL.
   - Proxies the request directly to `127.0.0.1:8081` and streams the response back.
3. If the process is offline or the hostname is unassigned, Portside returns a friendly status page.

---

## Update Management

Portside includes built-in update tracking:

| Installation Mode | Update Experience |
|---|---|
| **Launcher (`.exe`)** | Automatically checks for releases on GitHub every time it launches, alerting you to update immediately. |
| **Localhost (`git`)** | The web dashboard checks GitHub releases in the background and displays a notification modal with changelogs, `git pull` instructions, and a download link for the automated `.exe`. |

You can also manually check for updates anytime in **Settings → Version & Updates**.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js development server on Port 80 with Turbopack |
| `npm run build` | Compile Next.js production build |
| `npm run start` | Start production server |
| `npm run typecheck` | Validate TypeScript types without emitting output |
| `npm run lint` | Run ESLint static analysis |
| `npm run db:push` | Push schema changes directly to PostgreSQL |
| `npm run db:studio` | Launch Drizzle Studio database manager |

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Frontend:** React 19, Tailwind CSS v4
- **Database & ORM:** PostgreSQL 16, Drizzle ORM
- **Launcher:** Go (Native Windows x64 binary)
- **Language:** TypeScript

---

## Author & Credits

Created by **pact**
- **GitHub:** [@letsmakepact](https://github.com/letsmakepact)
- **Telegram:** [@pactwithdevil](https://t.me/pactwithdevil)

---

## License

[MIT](LICENSE)