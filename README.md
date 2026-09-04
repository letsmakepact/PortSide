# ⚓ Portside

Portside is a local development reverse proxy and management dashboard that gives every local service its own `*.localhost` domain without editing `/etc/hosts`.

Created by **pact** ([letsmakepact](https://github.com/letsmakepact) on GitHub, [@pactwithdevil](https://t.me/pactwithdevil) on Telegram).

## Features

- **Clean `*.localhost` Routing on Port 80:** Maps subdomains (like `api.localhost` or `shop.localhost`) directly to your internal local ports (e.g., `:8081`, `:3001`) with zero port numbers in your browser address bar.
- **Cross-Platform Standalone Launcher (Windows, macOS & Linux):** Automated zero-dependency setup tool that starts PostgreSQL, verifies dependencies, and automatically checks GitHub releases for updates on every run.
- **Auto-Provisioned User Directory:** Automatically creates `~/Portside/updates` inside your user directory across Windows, macOS, and Linux to store downloads and launcher executables.
- **Interactive First-Time Tutorial:** Built-in guided walkthrough demonstrating all features, routing mechanics, and shortcuts directly inside the dashboard.
- **Update Tracking & Web Notifications:** Automatically detects new releases from GitHub and notifies users running on localhost with 1-click update options and changelogs.
- **Live Background Monitor:** Periodically probes all active ports, checks latency, and logs online/offline state changes.
- **Projects & Tags:** Organize related services into color-coded projects.
- **Pin & Pause:** Pin critical routes to the top or temporarily pause traffic to specific ports with custom status pages.
- **Redirect Rewriting:** Rewrites upstream redirect headers back to your clean `*.localhost` hostnames.
- **Activity Feed:** Full audit log of service registrations, port updates, and connectivity changes.

## Tech Stack

- Next.js 16 (Turbopack, App Router)
- React 19
- Tailwind CSS v4
- PostgreSQL + Drizzle ORM
- TypeScript
- Go (Native Multi-Platform Launcher for Windows, macOS, and Linux)

## Quick Start

### Option A: Standalone Launcher (Recommended)

Download the pre-compiled launcher for your operating system from [GitHub Releases](https://github.com/letsmakepact/PortSide/releases/latest):

| Operating System | Binary Asset |
|---|---|
| **Windows** (x64) | `Portside-Launcher.exe` |
| **macOS** (Apple Silicon M1/M2/M3/M4) | `Portside-Launcher-darwin-arm64` |
| **macOS** (Intel) | `Portside-Launcher-darwin-amd64` |
| **Linux** (x86_64) | `Portside-Launcher-linux-amd64` |
| **Linux** (arm64) | `Portside-Launcher-linux-arm64` |

#### One-Line Terminal Setup (macOS & Linux):

```bash
curl -fsSL https://raw.githubusercontent.com/letsmakepact/PortSide/main/install.sh | bash
```

**What the Launcher Does:**
- Creates `~/Portside/updates` in your user home directory.
- Checks GitHub for new releases and downloads updates automatically.
- Starts the PostgreSQL Docker container if not already running.
- Syncs schema tables and launches Portside on Port 80.
- Opens `http://localhost` directly in your default browser.

---

### Option B: Manual Localhost Setup (All Platforms)

#### 1. Clone & Install

```bash
git clone https://github.com/letsmakepact/PortSide.git
cd PortSide
npm install
```

#### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Default configuration runs on standard HTTP port 80:

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/portside_db
PORT=80
```

#### 3. Start PostgreSQL

Use Docker Compose to start a local database:

```bash
docker compose up -d
```

#### 4. Initialize Database Schema

Push the Drizzle schema to your database:

```bash
npm run db:push
```

#### 5. Run Development Server

```bash
npm run dev
```

*(On macOS or Linux, binding port 80 may require `sudo npm run dev` or configuring capabilities, otherwise set `PORT=3000` in `.env`).*

Open [http://localhost](http://localhost) in your browser.

A default demo account is ready:
- **Email:** `demo@portside.dev`
- **Password:** `demo1234`

## Clean URLs Without Ports

Because Portside runs on standard HTTP port 80, modern browsers resolve any `*.localhost` subdomain directly:

- `http://api.localhost` → routes to your local API process
- `http://shop.localhost` → routes to your local web process
- `http://admin.localhost` → routes to your admin panel

No `/etc/hosts` modifications, port suffixes, or reverse proxy certificates required.

## Available Scripts

- `npm run dev`: Start Next.js on Port 80 with Turbopack.
- `npm run build`: Build for production.
- `npm run start`: Start production server.
- `npm run lint`: Run ESLint checks.
- `npm run typecheck`: Validate TypeScript types without emitting files.
- `npm run db:generate`: Generate migration files from schema changes.
- `npm run db:push`: Push schema definitions directly to PostgreSQL.
- `npm run db:studio`: Launch Drizzle Studio database viewer.

## Author & Credits

Created by **pact**
- GitHub: [@letsmakepact](https://github.com/letsmakepact)
- Telegram: [@pactwithdevil](https://t.me/pactwithdevil)

## License & Terms of Use

PortSide is licensed under the **Portside Non-Commercial Public License (PNC-1.0)**:

- **100% Free Forever for Single Users:** PortSide is completely free for individual developers, hobbyists, and personal development workflows. It will **never** be paid or monetized for single users.
- **No Reselling or Profiting:** Anyone is free to use and modify PortSide, but you may **NOT** sell, rent, sublicense, or distribute PortSide or its derivatives for a fee.
- **No Rebranding:** You may **NOT** rebrand, white-label, or remove creator attribution (`pact`) to generate profit.
- **Commercial & Company Inquiries:** Companies, corporations, and enterprise entities seeking commercial integration, deployment, or custom licensing must contact the creator:
  - Telegram: [@pactwithdevil](https://t.me/pactwithdevil)
  - GitHub: [@letsmakepact](https://github.com/letsmakepact)

See the full [LICENSE](LICENSE) file for complete terms.
