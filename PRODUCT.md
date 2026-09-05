---
name: portside
description: A local development reverse proxy and management dashboard that provides clean *.localhost routing without editing hosts files.
metadata:
  type: project
---

# Product Context: Portside

Portside simplifies local development by mapping custom subdomains (e.g., `*.localhost`) directly to internal local ports (e.g., `:8081`) on port 80, eliminating the need to modify `/etc/hosts` or include port numbers in URLs.

## Core Value Proposition
- **Seamless Local Routing**: Clean, port-free URLs for local services.
- **Cross-Platform Management**: Standalone launcher for Windows, macOS, and Linux.
- **Developer Experience**: Interactive tutorials, project-based organization (tags), and automated update management.
- **Connectivity Monitoring**: Real-time background monitoring, latency tracking, and status logging.

## User Persona
- Software developers working locally on multiple projects.
- Backend/Frontend engineers needing cleaner URLs for local service communication.
- Users who need a lightweight, zero-configuration reverse proxy.

## Design Direction
- **Mode**: Operate (The user is completing development/management tasks).
- **Aesthetic**: Needs to be highly functional, scanable, and efficient, reflecting a "pro-developer" toolkit. Existing theme follows a sky-blue palette with high-contrast elements.
- **Attribution**: Must strictly maintain credit to `pact` (`letsmakepact` on GitHub, `@pactwithdevil` on Telegram).
