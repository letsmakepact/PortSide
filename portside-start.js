/**
 * portside-start.js
 *
 * Portside startup script — claims port 80 before Next.js starts.
 * Detects what's holding port 80, stops it, then hands off to Next.
 *
 * Primary Author: pact (https://github.com/letsmakepact, t.me/pactwithdevil)
 */

const { execSync, spawnSync, spawn } = require('child_process');

const isDev = process.argv.includes('--dev');
const PORT  = 80;

// Known Windows services that commonly sit on port 80
const KNOWN_SERVICES = [
  'W3SVC',       // IIS World Wide Web Publishing Service
  'http',        // HTTP.sys (Windows HTTP API)
  'Apache2.4',   // Apache HTTP Server
  'Apache',      // Apache (older)
  'nginx',       // nginx as service
  'httpd',       // generic Apache
  'IISADMIN',    // IIS Admin
  'WAS',         // Windows Process Activation Service (IIS dependency)
  'xampp',       // XAMPP
];

function run(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe','pipe','pipe'] }).trim();
  } catch {
    return '';
  }
}

// Returns PID holding port 80, or null
function getPort80Pid() {
  const out = run(`netstat -ano -p TCP`);
  for (const line of out.split('\n')) {
    if (line.match(/[\s:]80\s/) && line.includes('LISTENING')) {
      const parts = line.trim().split(/\s+/);
      const pid = parseInt(parts[parts.length - 1]);
      if (!isNaN(pid) && pid > 0) return pid;
    }
  }
  return null;
}

// Returns process name for a PID
function getProcessName(pid) {
  const out = run(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`);
  const match = out.match(/"([^"]+)"/);
  return match ? match[1].toLowerCase() : '';
}

// Returns which Windows service owns a PID (if any)
function getServiceForPid(pid) {
  const out = run(`tasklist /SVC /FI "PID eq ${pid}" /FO CSV /NH`);
  const match = out.match(/"[^"]+","[^"]+","([^"]+)"/);
  return match ? match[1] : '';
}

// Stop a Windows service by name
function stopService(name) {
  console.log(`[Portside] Stopping service: ${name}`);
  run(`sc stop "${name}"`);
  // Disable auto-start so it doesn't fight us on reboot
  run(`sc config "${name}" start= demand`);
}

// Kill a process by PID
function killPid(pid) {
  console.log(`[Portside] Killing PID ${pid}`);
  run(`taskkill /PID ${pid} /F`);
}

async function claimPort80() {
  const pid = getPort80Pid();

  if (!pid) {
    console.log(`[Portside] Port ${PORT} is free.`);
    return;
  }

  const procName = getProcessName(pid);
  const services = getServiceForPid(pid);
  console.log(`[Portside] Port ${PORT} held by PID ${pid} (${procName}) — services: ${services || 'none'}`);

  // Try to stop known services first (cleaner than killing)
  let stopped = false;
  for (const svc of KNOWN_SERVICES) {
    if (services.toLowerCase().includes(svc.toLowerCase())) {
      stopService(svc);
      stopped = true;
      break;
    }
  }

  // If it's a known web server process name but no service found, kill directly
  if (!stopped) {
    const knownProcs = ['iis', 'apache', 'nginx', 'httpd', 'w3wp', 'node', 'python', 'ruby'];
    const isKnown = knownProcs.some(p => procName.includes(p));

    if (isKnown) {
      killPid(pid);
      stopped = true;
    }
  }

  if (!stopped) {
    console.warn(`[Portside] Unknown process on port ${PORT}: ${procName} (PID ${pid})`);
    console.warn(`[Portside] Run this to free it: taskkill /PID ${pid} /F`);
    process.exit(1);
  }

  // Wait for port to actually free up (up to 5 seconds)
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 500));
    if (!getPort80Pid()) {
      console.log(`[Portside] Port ${PORT} is now free.`);
      return;
    }
  }

  console.error(`[Portside] Port ${PORT} still occupied after 5s. Giving up.`);
  process.exit(1);
}

async function main() {
  console.log(`[Portside] Starting on port ${PORT}...`);
  await claimPort80();

  // Start Next.js
  const args = isDev
    ? ['next', 'dev', '-p', String(PORT)]
    : ['next', 'start', '-p', String(PORT)];

  const child = spawn('npx', args, { stdio: 'inherit', shell: true });

  child.on('exit', code => process.exit(code ?? 0));
  process.on('SIGINT',  () => child.kill('SIGINT'));
  process.on('SIGTERM', () => child.kill('SIGTERM'));
}

main();
