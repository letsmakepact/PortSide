# Portside

Portside is a local development reverse proxy and management dashboard that gives every local service its own `*.localhost` domain without editing `/etc/hosts`.

## Features

- **Automatic `*.localhost` Routing:** Maps subdomains (like `api.localhost:3000` or `shop.localhost:3000`) directly to your internal local ports (e.g., `:8081`, `:3001`).
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

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/portside.git
cd portside
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

### 3. Start PostgreSQL

Use Docker Compose to start a local database:

```bash
docker compose up -d
```

### 4. Initialize Database Schema

Push the Drizzle schema to your database:

```bash
npm run db:push
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

A default demo account is automatically seeded:
- **Email:** `demo@portside.dev`
- **Password:** `demo1234`

## Running on Port 80

To use clean hostnames without the `:3000` port suffix (e.g., `http://api.localhost`):

```bash
PORT=80 npm start
```

## Available Scripts

- `npm run dev`: Start Next.js in development mode with Turbopack.
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

## License

MIT