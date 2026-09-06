# Portside

Portside is a local development reverse proxy and management dashboard that gives every local service its own `*.localhost` domain without editing `/etc/hosts`.

Created by **pact** ([letsmakepact](https://github.com/letsmakepact) on GitHub, [@pactwithdevil](https://t.me/pactwithdevil) on Telegram).

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-pacts-5F7FFF?style=for-the-badge&logo=buy-me-a-coffee&logoColor=white)](https://buymeacoffee.com/pacts)

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

## Supporter Features

PortSide Supporter unlocks specialized hardware, network orchestration, and remote testing capabilities designed for mobile devices, smart displays, and distributed development:

- **Zero-Config Mobile & Smart TV LAN Routing:** Access your services from mobile phones, tablets, and Smart TVs on your local Wi-Fi with zero DNS or router changes.
- **Global Remote Access (5G / Cellular / Anywhere):** Automatic encrypted outbound tunnel (`cloudflared`) allowing you to test your localhost services from anywhere in the world on mobile data or external networks. Completely bypasses NAT, router firewalls, and active VPNs (such as Mullvad).
- **Private Dev Wi-Fi Hotspot:** Spin up an isolated, hardware-encrypted wireless access point directly from Windows without touching your home or office router.
- **Cryptographic Fleet Security:** Employs Ed25519-signed ephemeral session tickets (`PST1`) and 5-minute single-use pairing tokens (`PAIR1`) to keep your network secure.

## Testing on Mobile Devices

### Using Portside on iOS (iPhone & iPad)

Because Apple WebKit and iOS enforce RFC 6761, typing `localhost` in mobile Safari resolves strictly to the iPhone itself (`127.0.0.1`), not your development PC. PortSide makes local testing on iOS seamless with native zero-configuration mDNS (Bonjour):

1. Connect your iPhone or iPad to the same Wi-Fi network as your host computer.
2. In mobile Safari, navigate directly to:
   ```
   http://portside.local
   ```
   Apple Bonjour natively resolves `.local` hostnames across your local network with zero configuration required.
3. You can also directly open any mapped service subdomain:
   ```
   http://<service-name>.local
   ```
   (For example: `http://shop.local`, `http://router.local`)
4. Alternatively, open the **Mobile & TV Access** modal in your desktop dashboard and scan the instant QR code with your iPhone camera to open your services immediately.

### Android Version (In Active Development)

Unlike iOS, Android does not ship with universal mDNS resolution across all browser engines. We are actively engineering a dedicated Android companion client to enable seamless one-click reverse port mapping, so Android developers can type `http://localhost` directly into mobile Chrome and immediately hit their PC's running services.

Want the Android version sooner? Supporting the project on Buy Me a Coffee directly funds development and helps bring the Android companion and expanded mobile tooling to life faster:

[Support PortSide on Buy Me a Coffee](https://buymeacoffee.com/pacts)


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

## License & Terms of Use

PortSide is licensed under the **Portside Non-Commercial Public License (PNC-1.0)**:

- **100% Free Forever for Single Users:** PortSide is completely free for individual developers, hobbyists, and personal development workflows. It will **never** be paid or monetized for single users.
- **No Reselling or Profiting:** Anyone is free to use and modify PortSide, but you may **NOT** sell, rent, sublicense, or distribute PortSide or its derivatives for a fee.
- **No Rebranding:** You may **NOT** rebrand, white-label, or remove creator attribution (`pact`) to generate profit.
- **Commercial & Company Inquiries:** Companies, corporations, and enterprise entities seeking commercial integration, deployment, or custom licensing must contact the creator:
  - Telegram: [@pactwithdevil](https://t.me/pactwithdevil)
  - GitHub: [@letsmakepact](https://github.com/letsmakepact)

See the full [LICENSE](LICENSE) file for complete terms.
