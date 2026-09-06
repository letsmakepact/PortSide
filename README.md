# Portside

Portside is a local development reverse proxy, cockpit, and multi-device launchpad that gives every local service its own clean `*.localhost` domain without editing `/etc/hosts`.

Created by **pact** ([letsmakepact](https://github.com/letsmakepact) on GitHub, [@pactwithdevil](https://t.me/pactwithdevil) on Telegram).

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-pacts-5F7FFF?style=for-the-badge&logo=buy-me-a-coffee&logoColor=white)](https://buymeacoffee.com/pacts)

---

## Fully Supports All Devices

Portside is engineered from the ground up to **fully support every device you build on or test with**:

- **Smartphones (iOS & Android):** Zero-friction mobile access with Error Correction Level `H` camera QR codes, safe-area notch & gesture-bar insets, touch ergonomics (`>=44px` hit targets), and standalone PWA home screen installation.
- **Tablets & Foldables (iPad, Android Tablets, Surface):** Fluid adaptive multi-column grid layouts with seamless landscape and portrait orientation transitions.
- **Laptops & Workstations (macOS, Windows, Linux):** Full developer cockpit with fast keyboard navigation, port health probing, project grouping, and instant 1-click controls.
- **Smart TVs & 10-Foot Displays (LG webOS, Samsung Tizen, Android TV, Fire TV, Apple TV):** Built-in spatial keyboard D-pad remote control (`ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`, `Enter`) with glowing 4px sky-blue focus rings for wireless testing from your couch without HDMI cables.

---

## Features

- **Clean `*.localhost` Routing on Port 80:** Map subdomains (like `api.localhost` or `shop.localhost`) directly to your internal local ports (e.g., `:8081`, `:3001`) with zero port numbers in your address bar.
- **Full Cross-Device Support:** Dedicated UI ergonomics for smartphones (320px–430px), tablets, laptops/desktops, and 10-foot Smart TV screens.
- **Smart TV Remote & D-Pad Navigation:** Built-in spatial navigation using TV remote arrow keys and high-visibility electric focus rings for big-screen app testing.
- **Device-Tailored Interactive Tutorial:** Automatically detects your active device (Laptop/PC, Phone/Tablet, Smart TV) and delivers customized onboarding tips with an interactive device switcher.
- **High-Redundancy Brand QR Code:** Error Correction Level `H` (30% redundancy) QR code with center transparent anchor emblem for instant phone camera scanning.
- **Cross-Platform Standalone Launcher (Windows, macOS & Linux):** Automated zero-dependency setup tool that starts PostgreSQL, verifies dependencies, and checks GitHub releases for updates on every run.
- **Auto-Provisioned User Directory:** Automatically creates `~/Portside/updates` inside your user directory across Windows, macOS, and Linux to store downloads and launcher executables.
- **Live Background Port Monitor:** Probes all active ports in real-time, measures latency, and logs online/offline state changes with instant crash alerts.
- **Projects & Color-Coded Groups:** Organize microservices and related processes into unified project suites.
- **Pin & Pause Controls:** Pin high-frequency routes or temporarily pause traffic with polite fallback explainer screens.
- **Header & Redirect Rewriting:** Rewrites upstream redirect and Host headers back to your clean `*.localhost` hostnames.
- **Activity Feed & Audit Log:** Chronological audit log of service registrations, port updates, and connectivity fluctuations.

---

## Free vs. Supporter Tier

Portside is 100% free for individual developers, with optional Supporter perks for advanced multi-device and remote workflows:

| Feature | Free Tier | Supporter Perk |
|---|:---:|:---:|
| **Clean `*.localhost` on PC/Mac/Linux** | Yes (Unlimited) | Yes |
| **Direct LAN Project Redirects (`/s/<project>`)** | Yes (Included) | Yes |
| **Wildcard Subdomain Redirects (`<project>.<lan-ip>.nip.io`)** | Yes (Included) | Yes |
| **Instant Scannable Project QR Code** | Yes (Included) | Yes |
| **Full Device Support (Mobile, Tablet, Laptop, TV)** | Yes (Included) | Yes |
| **Smart TV Remote D-Pad Navigation** | Yes (Included) | Yes |
| **Device-Specific Guided Tutorial** | Yes (Included) | Yes |
| **Personal Multi-Service Launchpad Dashboard (`/lan`)** | Jump Links | Full Interactive Dashboard |
| **Clean `.local` / `.localhost` on OTHER Devices** | Raw IP / nip.io | Clean Zero-Config Names |
| **Isolated Dev Wi-Fi Hotspot** | - | Yes |
| **Global 5G / Cellular Tunneling (`*.portside.lol`)** | - | Yes |

---

## Multi-Device Testing & Workflows

### 1. Mobile Phones & Tablets (iOS & Android)
- **Instant Camera Scan:** Open the **Mobile / TV LAN** modal in your dashboard and point your phone camera at the QR code.
- **Free Direct Redirect:** Automatically jumps to `http://<lan-ip>/s/<project>` or `http://<project>.<lan-ip>.nip.io` over your local Wi-Fi with zero configuration.
- **Clean Local Names (Supporters):** Open `http://<project>.local` directly in mobile Safari or Chrome without typing raw IP addresses.
- **Home Screen PWA:** Tap "Add to Home Screen" to install Portside as a standalone mobile app with safe-area notch and home-bar padding.

### 2. Smart TVs & Big Screen Displays (10-Foot UI)
- **Wireless TV Testing:** Open the built-in web browser on your LG (webOS), Samsung (Tizen), Android TV, Fire TV, or Apple TV.
- **Navigate to:**
  ```
  http://<your-lan-ip>/lan
  ```
- **Remote Control Navigation:** Use the physical arrow keys on your TV remote control to glide between launch cards with 4px glowing sky-blue focus rings. Press **OK / Enter** on the remote to launch full-screen.

### 3. Laptops & Desktops (Workstation Cockpit)
- Full-featured dashboard with searchable service lists, project filters, port probing latency metrics, and 1-click controls.

---

## Tech Stack

- **Framework:** Next.js 16 (Turbopack, App Router)
- **UI & Styling:** React 19, Tailwind CSS v4, Lucide Icons
- **Database & ORM:** PostgreSQL + Drizzle ORM
- **Language:** TypeScript
- **Launcher:** Go (Native Multi-Platform Launcher for Windows, macOS, and Linux)

---

## Quick Start

### Option A: Standalone Launcher (Recommended)

Download the pre-compiled launcher for your operating system from [GitHub Releases](https://github.com/letsmakepact/PortSide/releases/latest):

| Operating System | Binary Asset |
|---|---|
| **Windows** (x64) | `Portside.exe` (with embedded anchor emblem) |
| **macOS** (Apple Silicon M1/M2/M3/M4) | `Portside-darwin-arm64` / `Portside.app` |
| **macOS** (Intel) | `Portside-darwin-amd64` / `Portside.app` |
| **Linux** (x86_64) | `Portside-linux-amd64` / `Portside` |
| **Linux** (arm64) | `Portside-linux-arm64` |

#### One-Line Terminal Setup (macOS & Linux):

```bash
curl -fsSL https://raw.githubusercontent.com/letsmakepact/PortSide/main/install.sh | bash
```

---

### Option B: Manual Setup

#### 1. Clone & Install
```bash
git clone https://github.com/letsmakepact/PortSide.git
cd PortSide
npm install
```

#### 2. Configure Environment
```bash
cp .env.example .env
```

Default configuration:
```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/portside_db
PORT=80
```

#### 3. Start PostgreSQL
```bash
docker compose up -d
```

#### 4. Push Database Schema
```bash
npm run db:push
```

#### 5. Run Development Server
```bash
npm run dev
```

*(On macOS or Linux, binding port 80 may require `sudo npm run dev` or setting `PORT=3000` in `.env`).*

Open [http://localhost](http://localhost) in your browser. Default demo account:
- **Email:** `demo@portside.dev`
- **Password:** `demo1234`

---

## Clean URLs Without Ports

Because Portside runs on standard HTTP port 80, modern browsers resolve any `*.localhost` subdomain directly:

- `http://api.localhost` → routes to your local API process
- `http://shop.localhost` → routes to your local web process
- `http://admin.localhost` → routes to your admin panel

No `/etc/hosts` modifications, port suffixes, or reverse proxy certificates required.

---

## License & Terms of Use

PortSide is licensed under the **Portside Non-Commercial Public License (PNC-1.0)**:

- **100% Free Forever for Single Users:** PortSide is completely free for individual developers, hobbyists, and personal development workflows. It will **never** be paid or monetized for single users.
- **No Reselling or Profiting:** Anyone is free to use and modify PortSide, but you may **NOT** sell, rent, sublicense, or distribute PortSide or its derivatives for a fee.
- **No Rebranding:** You may **NOT** rebrand, white-label, or remove creator attribution (`pact`) to generate profit.
- **Commercial & Company Inquiries:** Companies seeking commercial integration or custom licensing must contact the creator:
  - Telegram: [@pactwithdevil](https://t.me/pactwithdevil)
  - GitHub: [@letsmakepact](https://github.com/letsmakepact)

See the full [LICENSE](LICENSE) file for complete terms.
