package main

// api_health.go — handles api.portside.lol health/status dashboard.
// Routes:
//   GET /          → HTML status dashboard (dark cyber aesthetic)
//   GET /health    → JSON simple health check
//   GET /status    → JSON detailed status (nodes, relay services)

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

// ─────────────────────────────────────────────────────────────
// Router
// ─────────────────────────────────────────────────────────────

func (s *RelayServer) handleAPISubdomain(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	path := strings.TrimRight(r.URL.Path, "/")
	switch path {
	case "/health":
		s.apiHealth(w, r)
	case "/status":
		s.apiStatus(w, r)
	default:
		s.apiDashboard(w, r)
	}
}

// ─────────────────────────────────────────────────────────────
// /health — minimal JSON ping
// ─────────────────────────────────────────────────────────────

func (s *RelayServer) apiHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	nodes := s.connectedNodeCount()
	status := "operational"
	if nodes == 0 {
		status = "standby"
	}
	json.NewEncoder(w).Encode(map[string]interface{}{
		"ok":         true,
		"status":     status,
		"nodes_live": nodes,
		"relay":      "up",
		"ts":         time.Now().UTC().Format(time.RFC3339),
	})
}

// ─────────────────────────────────────────────────────────────
// /status — detailed JSON
// ─────────────────────────────────────────────────────────────

func (s *RelayServer) apiStatus(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	nodes := s.liveNodes()
	json.NewEncoder(w).Encode(map[string]interface{}{
		"ok": true,
		"ts": time.Now().UTC().Format(time.RFC3339),
		"relay": map[string]interface{}{
			"status":     "up",
			"nodes_live": len(nodes),
			"nodes":      nodes,
		},
		"edge": map[string]interface{}{
			"status":   "up",
			"wildcard": "*.portside.lol",
			"tls":      "active",
		},
	})
}

// ─────────────────────────────────────────────────────────────
// /  — HTML dashboard
// ─────────────────────────────────────────────────────────────

func (s *RelayServer) apiDashboard(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")

	nodes := s.liveNodes()

	// Build node rows
	nodeRows := ""
	if len(nodes) == 0 {
		nodeRows = `<tr><td colspan="3" style="text-align:center;color:#475569;padding:24px">No active nodes connected right now</td></tr>`
	} else {
		for _, n := range nodes {
			nodeRows += fmt.Sprintf(
				`<tr><td><code class="pill">%s.portside.lol</code></td><td style="font-family:monospace;color:#94a3b8">%s</td><td><span class="badge-green"><span class="dot-green"></span> LIVE</span></td></tr>`,
				n["handle"], n["machine_id"],
			)
		}
	}

	overallStatus := "Operational"
	overallColor := "#10b981"
	if len(nodes) == 0 {
		overallStatus = "Standby"
		overallColor = "#38bdf8"
	}

	fmt.Fprintf(w, healthHTML,
		overallColor, overallColor,
		overallStatus,
		overallColor, overallColor,
		overallStatus,
		time.Now().UTC().Format("Jan 02, 2006 · 15:04 UTC"),
		len(nodes),
		nodeRows,
	)
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

type nodeInfo map[string]string

func (s *RelayServer) connectedNodeCount() int {
	s.clientsMu.RLock()
	defer s.clientsMu.RUnlock()
	return len(s.clients)
}

func (s *RelayServer) liveNodes() []nodeInfo {
	s.clientsMu.RLock()
	defer s.clientsMu.RUnlock()
	out := make([]nodeInfo, 0, len(s.clients))
	for handle, sess := range s.clients {
		if sess == nil {
			continue
		}
		out = append(out, nodeInfo{
			"handle":     handle,
			"machine_id": sess.machineId,
			"email":      sess.email,
		})
	}
	return out
}

// ─────────────────────────────────────────────────────────────
// HTML template
// ─────────────────────────────────────────────────────────────

const healthHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PortSide &middot; Network Status</title>
  <meta http-equiv="refresh" content="30">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #030712;
      --card: #0b111e;
      --border: #1a2538;
      --text: #f1f5f9;
      --dim: #64748b;
      --cyan: #38bdf8;
      --green: #10b981;
      --amber: #f59e0b;
      --red: #f43f5e;
    }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      min-height: 100vh;
      background-image: radial-gradient(ellipse 80%% 40%% at 50%% -10%%, rgba(14,165,233,0.1), transparent 70%%);
    }
    header {
      border-bottom: 1px solid var(--border);
      padding: 0 32px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(11,17,30,0.8);
      backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: var(--text);
    }
    .brand-icon {
      width: 32px; height: 32px;
      background: linear-gradient(135deg, #0284c7, #0f172a);
      border: 1px solid rgba(56,189,248,0.3);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 12px rgba(56,189,248,0.2);
    }
    .brand-name { font-size: 15px; font-weight: 700; letter-spacing: -0.3px; }
    .brand-sub  { font-size: 11px; color: var(--dim); letter-spacing: 0.05em; }
    .header-right { display: flex; align-items: center; gap: 16px; }
    .refresh-note { font-size: 12px; color: var(--dim); }
    .overall-badge {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 6px 16px;
      border-radius: 9999px;
      font-size: 13px; font-weight: 600;
      border: 1px solid;
    }
    .pulse { width: 8px; height: 8px; border-radius: 9999px; animation: pulse 2s infinite; }
    @keyframes pulse { 0%%,100%% { opacity:1; } 50%% { opacity:0.4; } }

    main { max-width: 860px; margin: 0 auto; padding: 40px 24px; }

    /* Status hero */
    .hero { text-align: center; margin-bottom: 40px; }
    .hero-status {
      display: inline-flex; align-items: center; gap: 10px;
      padding: 8px 20px;
      border-radius: 9999px;
      font-size: 14px; font-weight: 700;
      border: 1px solid;
      margin-bottom: 16px;
    }
    .hero-dot { width: 10px; height: 10px; border-radius: 9999px; }
    .hero h1 { font-size: 28px; font-weight: 800; margin-bottom: 6px; }
    .hero-sub { color: var(--dim); font-size: 14px; }

    /* Grid */
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    @media(max-width: 650px) { .grid-3 { grid-template-columns: 1fr; } }

    /* Cards */
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 20px 22px;
    }
    .card-title {
      font-size: 11px; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.08em; color: var(--dim);
      margin-bottom: 10px;
      display: flex; align-items: center; gap: 8px;
    }
    .card-value {
      font-size: 28px; font-weight: 800;
      letter-spacing: -1px;
      color: var(--cyan);
    }
    .card-label { font-size: 12px; color: var(--dim); margin-top: 4px; }

    /* Status rows */
    .status-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 0;
      border-bottom: 1px solid var(--border);
    }
    .status-row:last-child { border-bottom: none; }
    .status-name { font-size: 14px; font-weight: 500; }
    .status-desc { font-size: 12px; color: var(--dim); margin-top: 2px; }

    /* Badges */
    .badge-green { background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid rgba(16,185,129,0.3); padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; }
    .badge-cyan  { background: rgba(56,189,248,0.12); color: #38bdf8; border: 1px solid rgba(56,189,248,0.25); padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; }

    /* Table */
    .section-title {
      font-size: 13px; font-weight: 700; color: var(--dim);
      text-transform: uppercase; letter-spacing: 0.07em;
      margin: 32px 0 12px;
      display: flex; align-items: center; gap: 8px;
    }
    .table-wrap { background: var(--card); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; }
    table { width: 100%%; border-collapse: collapse; }
    th { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
         color: var(--dim); padding: 12px 20px; text-align: left;
         border-bottom: 1px solid var(--border); background: rgba(15,23,42,0.5); }
    td { padding: 14px 20px; font-size: 13px; border-bottom: 1px solid var(--border); vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(56,189,248,0.03); }
    code.pill { background: #111827; border: 1px solid #1e293b; border-radius: 6px; padding: 2px 8px; font-family: monospace; font-size: 12px; color: var(--cyan); }

    /* Dot indicators */
    .dot-green { display: inline-block; width: 7px; height: 7px; border-radius: 9999px; background: #10b981; box-shadow: 0 0 6px #10b981; }
    .dot-cyan  { display: inline-block; width: 7px; height: 7px; border-radius: 9999px; background: #38bdf8; box-shadow: 0 0 6px #38bdf8; }

    footer {
      text-align: center; padding: 32px 24px;
      color: var(--dim); font-size: 12px;
      border-top: 1px solid var(--border);
    }
    footer a { color: var(--cyan); text-decoration: none; }
  </style>
</head>
<body>

<header>
  <a class="brand" href="https://portside.lol">
    <div class="brand-icon">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/>
        <path d="M5 12H2a10 10 0 0 0 20 0h-3"/>
      </svg>
    </div>
    <div>
      <div class="brand-name">PortSide</div>
      <div class="brand-sub">HEALTH CHECKER</div>
    </div>
  </a>
  <div class="header-right">
    <span class="refresh-note">auto-refreshes every 30s</span>
    <span class="overall-badge" style="color:%s;border-color:%s;background:rgba(0,0,0,0.3)">
      <span class="pulse" style="background:%s"></span>
      %s
    </span>
  </div>
</header>

<main>

  <div class="hero">
    <div class="hero-status" style="color:%s;border-color:%s;background:rgba(0,0,0,0.4)">
      <span class="hero-dot" style="background:%[4]s;box-shadow:0 0 8px %[4]s"></span>
      All Core Relays %[6]s
    </div>
    <h1>PortSide Network Status</h1>
    <div class="hero-sub">%s</div>
  </div>

  <div class="grid-3">
    <div class="card">
      <div class="card-title"><span class="dot-cyan"></span> Active Nodes</div>
      <div class="card-value">%d</div>
      <div class="card-label">tunnels connected</div>
    </div>
    <div class="card">
      <div class="card-title"><span class="dot-green"></span> Reverse Tunnel Relay</div>
      <div class="card-value" style="font-size:18px;padding-top:6px"><span class="badge-green"><span class="dot-green"></span> OPERATIONAL</span></div>
      <div class="card-label">portsided-relay (:7000 / :7080)</div>
    </div>
    <div class="card">
      <div class="card-title"><span class="dot-green"></span> Edge Ingress</div>
      <div class="card-value" style="font-size:18px;padding-top:6px"><span class="badge-green"><span class="dot-green"></span> ACTIVE</span></div>
      <div class="card-label">Nginx *.portside.lol (:80 / :443)</div>
    </div>
  </div>

  <div class="section-title">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
    Relay Infrastructure
  </div>
  <div class="card">
    <div class="status-row">
      <div><div class="status-name">Multiplexed TCP Control Tunnel</div><div class="status-desc">Direct client link &middot; TCP :7000</div></div>
      <span class="badge-green"><span class="dot-green"></span> Operational</span>
    </div>
    <div class="status-row">
      <div><div class="status-name">HTTP Reverse Proxy Ingress</div><div class="status-desc">Local ingress bridge &middot; HTTP :7080</div></div>
      <span class="badge-green"><span class="dot-green"></span> Operational</span>
    </div>
    <div class="status-row">
      <div><div class="status-name">Edge Wildcard TLS Ingress</div><div class="status-desc">Cloudflare proxy &middot; *.portside.lol SSL/TLS</div></div>
      <span class="badge-green"><span class="dot-green"></span> Operational</span>
    </div>
  </div>

  <div class="section-title">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
    Connected Nodes
  </div>
  <div class="table-wrap">
    <table>
      <thead>
        <tr><th>Domain</th><th>Machine ID</th><th>Status</th></tr>
      </thead>
      <tbody>%s</tbody>
    </table>
  </div>

  <div class="section-title">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
    Health API Endpoints
  </div>
  <div class="card">
    <div class="status-row">
      <div><div class="status-name"><code class="pill">GET /health</code></div><div class="status-desc">Minimal JSON health check &middot; Relay &amp; node state</div></div>
      <a href="/health" style="color:var(--cyan);font-size:12px;text-decoration:none">→ Try it</a>
    </div>
    <div class="status-row">
      <div><div class="status-name"><code class="pill">GET /status</code></div><div class="status-desc">Full JSON status with connected nodes &amp; edge topology</div></div>
      <a href="/status" style="color:var(--cyan);font-size:12px;text-decoration:none">→ Try it</a>
    </div>
  </div>

</main>

<footer>
  <p>powered by <a href="https://portside.lol">PortSide</a> &mdash; zero third-party cloud hosting</p>
</footer>

</body>
</html>`
