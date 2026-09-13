#!/usr/bin/env node
import "dotenv/config";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { eq, or, desc } from "drizzle-orm";
import { db } from "../src/db/index.js";
import { services, users, activityLogs, projects } from "../src/db/schema.js";
import { getLanIp, getLanUrls } from "../src/lib/lan.js";

// Helper to sanitize hostname/subdomain to valid URL-safe alphanumeric characters
function sanitizeSubdomain(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

// Find primary/default local user if not specified
async function getDefaultUserId(): Promise<number> {
  const existingUsers = await db.select().from(users).limit(1);
  if (existingUsers.length > 0) {
    return existingUsers[0].id;
  }

  // Create a default local user if database is fresh
  const [newUser] = await db
    .insert(users)
    .values({
      email: "local@portside.localhost",
      name: "Local Developer",
      passwordHash: "local:disabled",
      tier: "free",
    })
    .returning();

  return newUser.id;
}

// Probe local port health
async function probePort(protocol: string, port: number): Promise<{ online: boolean; latencyMs: number | null }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1200);
  const started = Date.now();
  try {
    await fetch(`${protocol}://127.0.0.1:${port}/`, { method: "GET", signal: controller.signal, redirect: "manual" });
    return { online: true, latencyMs: Date.now() - started };
  } catch (err) {
    const code = (err as { cause?: { code?: string } })?.cause?.code;
    if (code && ["ERR_SSL_WRONG_VERSION_NUMBER", "EPROTO", "UND_ERR_SOCKET"].includes(code)) {
      return { online: true, latencyMs: Date.now() - started };
    }
    return { online: false, latencyMs: null };
  } finally {
    clearTimeout(timer);
  }
}

const server = new Server(
  {
    name: "portside-mcp",
    version: "1.1.0",
  },
  {
    capabilities: {
      tools: {},
      prompts: {},
      resources: {},
    },
  }
);

// Define tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "register_port_route",
        description:
          "Registers a local dev service port (e.g. 3000, 5173, 8080) with Portside to provide a clean *.localhost domain (e.g. http://my-app.localhost). Prevents duplicates by verifying both port numbers and custom names/subdomains. Always inform the user of the assigned URL and let them know they can customize or change it anytime at http://localhost.",
        inputSchema: {
          type: "object",
          properties: {
            port: {
              type: "number",
              description: "The internal local port number the service is listening on (e.g. 3000, 5173, 8080).",
            },
            name: {
              type: "string",
              description: "Descriptive human-readable name of the project or service (e.g. 'Todo App', 'Storefront API').",
            },
            subdomain: {
              type: "string",
              description: "Preferred subdomain name for the *.localhost URL (e.g. 'todo', 'storefront'). Optional; will be auto-derived from name if omitted.",
            },
            description: {
              type: "string",
              description: "Optional notes or details about the service.",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "Optional tags to organize the service in Portside (e.g. ['frontend', 'react']).",
            },
          },
          required: ["port"],
        },
      },
      {
        name: "list_active_routes",
        description: "Lists all currently registered services, their ports, latency status, and their *.localhost URLs in Portside.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "check_route_availability",
        description: "Checks if a specific port number or custom subdomain name is already in use in Portside.",
        inputSchema: {
          type: "object",
          properties: {
            port: {
              type: "number",
              description: "Port number to check for collision.",
            },
            subdomain: {
              type: "string",
              description: "Subdomain/custom name to check for collision.",
            },
          },
        },
      },
      {
        name: "probe_service_health",
        description: "Probes an internal port or registered service in real-time to check if it's currently online and responding.",
        inputSchema: {
          type: "object",
          properties: {
            port: {
              type: "number",
              description: "Port number to probe.",
            },
            subdomain: {
              type: "string",
              description: "Subdomain of registered service to probe.",
            },
          },
        },
      },
      {
        name: "get_lan_preview_links",
        description: "Generates mobile testing and cross-device preview URLs (e.g. /s/<name> direct link, nip.io wildcard URL, and local LAN IP) for testing on smartphones, tablets, or Smart TVs.",
        inputSchema: {
          type: "object",
          properties: {
            subdomain: {
              type: "string",
              description: "Subdomain of the service (e.g. 'storefront').",
            },
          },
          required: ["subdomain"],
        },
      },
      {
        name: "toggle_service_pause",
        description: "Pauses or resumes routing for a registered Portside service.",
        inputSchema: {
          type: "object",
          properties: {
            subdomain: {
              type: "string",
              description: "Subdomain of the service to pause/resume.",
            },
            enabled: {
              type: "boolean",
              description: "True to resume routing, false to pause traffic.",
            },
          },
          required: ["subdomain", "enabled"],
        },
      },
      {
        name: "remove_port_route",
        description: "Removes or unregisters a service route from Portside by its subdomain or port.",
        inputSchema: {
          type: "object",
          properties: {
            subdomain: {
              type: "string",
              description: "The subdomain to remove (e.g. 'todo' for todo.localhost).",
            },
            port: {
              type: "number",
              description: "The port number to remove if subdomain is not known.",
            },
          },
        },
      },
    ],
  };
});

// Resources: expose Portside configuration & routes as MCP resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "portside://routes",
        name: "Portside Active Routes",
        description: "List of all active .localhost reverse proxy routes mapped in Portside.",
        mimeType: "application/json",
      },
      {
        uri: "portside://lan",
        name: "Portside Local Network (LAN) Configuration",
        description: "Current LAN IP and cross-device testing endpoints.",
        mimeType: "application/json",
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  if (request.params.uri === "portside://routes") {
    const allServices = await db.select().from(services).orderBy(desc(services.favorite), services.name);
    return {
      contents: [
        {
          uri: request.params.uri,
          mimeType: "application/json",
          text: JSON.stringify(
            allServices.map((s) => ({
              id: s.id,
              name: s.name,
              hostname: s.hostname,
              url: `http://${s.hostname}.localhost`,
              port: s.port,
              enabled: s.enabled,
              status: s.lastStatus,
              tags: s.tags,
            })),
            null,
            2
          ),
        },
      ],
    };
  }

  if (request.params.uri === "portside://lan") {
    const lanIp = getLanIp();
    return {
      contents: [
        {
          uri: request.params.uri,
          mimeType: "application/json",
          text: JSON.stringify(
            {
              lanIp,
              portalUrl: `http://${lanIp}/lan`,
              dashboardUrl: "http://localhost/dashboard",
            },
            null,
            2
          ),
        },
      ],
    };
  }

  throw new Error(`Resource not found: ${request.params.uri}`);
});

// Prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "portside_developer_instructions",
        description: "Instructions for how AI assistants should present local URLs to users.",
      },
    ],
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  if (request.params.name === "portside_developer_instructions") {
    return {
      description: "Portside URL Presentation Guidelines",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: "Whenever you launch a dev server or local service on a port, register it using the 'register_port_route' tool. Always provide the clean http://<subdomain>.localhost URL to the user instead of raw http://localhost:<port>. Remind the user that they can view, edit, or change this route anytime in Portside at http://localhost if they prefer a different name or port.",
          },
        },
      ],
    };
  }
  throw new Error(`Prompt '${request.params.name}' not found.`);
});

// Tool execution logic
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "register_port_route") {
      const port = Number(args?.port);
      if (!port || port < 1 || port > 65535) {
        return {
          content: [
            {
              type: "text",
              text: `Error: Invalid port number (${args?.port}). Port must be between 1 and 65535.`,
            },
          ],
          isError: true,
        };
      }

      const rawName = String(args?.name || `Service on ${port}`).trim();
      let preferredSubdomain = sanitizeSubdomain(String(args?.subdomain || rawName || `app-${port}`));
      if (!preferredSubdomain) {
        preferredSubdomain = `app-${port}`;
      }

      const userId = await getDefaultUserId();

      // Query all existing services to check for collisions
      const existingServices = await db.select().from(services);

      // Check 1: Port Collision Check
      const existingPortService = existingServices.find((s) => s.port === port);

      // Check 2: Subdomain / Custom Name Collision Check
      let finalSubdomain = preferredSubdomain;
      let counter = 1;
      while (
        existingServices.some(
          (s) => s.hostname.toLowerCase() === finalSubdomain.toLowerCase() && s.port !== port
        )
      ) {
        finalSubdomain = `${preferredSubdomain}-${counter}`;
        counter++;
      }

      let serviceRecord;
      let wasUpdated = false;
      let portWarning = "";

      if (existingPortService) {
        // Port already registered: update the existing service mapping
        wasUpdated = true;
        const [updated] = await db
          .update(services)
          .set({
            name: rawName || existingPortService.name,
            hostname: finalSubdomain,
            description: String(args?.description || existingPortService.description || ""),
            tags: (args?.tags as string[]) || existingPortService.tags || [],
            enabled: true,
            updatedAt: new Date(),
          })
          .where(eq(services.id, existingPortService.id))
          .returning();

        serviceRecord = updated;
        portWarning = `(Note: Port ${port} was previously registered as '${existingPortService.hostname}.localhost' and has been cleanly updated to '${finalSubdomain}.localhost'.)`;
      } else {
        // Register brand new service
        const [created] = await db
          .insert(services)
          .values({
            userId,
            name: rawName,
            hostname: finalSubdomain,
            port,
            protocol: "http",
            description: String(args?.description || ""),
            tags: (args?.tags as string[]) || [],
            enabled: true,
          })
          .returning();

        serviceRecord = created;
      }

      // Log activity
      await db.insert(activityLogs).values({
        userId,
        serviceId: serviceRecord.id,
        action: wasUpdated ? "updated" : "created",
        message: `MCP: ${wasUpdated ? "Updated" : "Registered"} ${finalSubdomain}.localhost → :${port}`,
      });

      // Quick health probe
      const probeResult = await probePort("http", port);
      const isOnline = probeResult.online;

      const cleanUrl = `http://${finalSubdomain}.localhost`;
      const dashboardUrl = "http://localhost/dashboard";

      let responseText = `Successfully registered route in Portside!\n`;
      responseText += `• Custom URL: ${cleanUrl}\n`;
      responseText += `• Target Port: ${port}\n`;
      responseText += `• Port Status: ${isOnline ? `Online (${probeResult.latencyMs}ms latency)` : "Waiting for service to listen on port"}\n`;
      if (finalSubdomain !== preferredSubdomain) {
        responseText += `• Note on Custom Name: '${preferredSubdomain}' was already assigned to another port. Automatically assigned deduplicated name '${finalSubdomain}'.\n`;
      }
      if (portWarning) {
        responseText += `• ${portWarning}\n`;
      }
      responseText += `\nINSTRUCTION FOR ASSISTANT: Inform the user that their service is live at ${cleanUrl}. Also explicitly remind them: "If you want to change the port or pick a different custom domain name, you can adjust it anytime in your Portside dashboard at ${dashboardUrl}."`;

      return {
        content: [
          {
            type: "text",
            text: responseText,
          },
        ],
      };
    }

    if (name === "list_active_routes") {
      const allServices = await db
        .select()
        .from(services)
        .orderBy(desc(services.favorite), services.name);

      if (allServices.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No services are currently registered in Portside.",
            },
          ],
        };
      }

      const formatted = allServices.map((s) => ({
        name: s.name,
        subdomain: s.hostname,
        url: `http://${s.hostname}.localhost`,
        port: s.port,
        enabled: s.enabled,
        status: s.lastStatus,
        latencyMs: s.lastLatencyMs,
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(formatted, null, 2),
          },
        ],
      };
    }

    if (name === "check_route_availability") {
      const port = args?.port ? Number(args.port) : null;
      const subdomain = args?.subdomain ? sanitizeSubdomain(String(args.subdomain)) : null;

      const existingServices = await db.select().from(services);

      const portMatch = port ? existingServices.find((s) => s.port === port) : null;
      const subdomainMatch = subdomain
        ? existingServices.find((s) => s.hostname.toLowerCase() === subdomain.toLowerCase())
        : null;

      const result = {
        portAvailable: port ? !portMatch : null,
        portUsedBy: portMatch ? `${portMatch.hostname}.localhost (${portMatch.name})` : null,
        subdomainAvailable: subdomain ? !subdomainMatch : null,
        subdomainUsedByPort: subdomainMatch ? subdomainMatch.port : null,
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    if (name === "probe_service_health") {
      const port = args?.port ? Number(args.port) : null;
      const subdomain = args?.subdomain ? sanitizeSubdomain(String(args.subdomain)) : null;

      let targetPort = port;
      let targetName = subdomain || `port ${port}`;

      if (!targetPort && subdomain) {
        const [found] = await db.select().from(services).where(eq(services.hostname, subdomain)).limit(1);
        if (found) {
          targetPort = found.port;
          targetName = `${found.hostname}.localhost`;
        }
      }

      if (!targetPort) {
        return {
          content: [{ type: "text", text: "Error: Could not determine port to probe." }],
          isError: true,
        };
      }

      const { online, latencyMs } = await probePort("http", targetPort);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                target: targetName,
                port: targetPort,
                online,
                latencyMs,
                checkedAt: new Date().toISOString(),
              },
              null,
              2
            ),
          },
        ],
      };
    }

    if (name === "get_lan_preview_links") {
      const subdomain = sanitizeSubdomain(String(args?.subdomain || ""));
      if (!subdomain) {
        return {
          content: [{ type: "text", text: "Error: Subdomain is required." }],
          isError: true,
        };
      }

      const lanIp = getLanIp();
      const urls = getLanUrls(subdomain, "80", lanIp);

      const response = {
        subdomain,
        lanIp,
        desktopUrl: `http://${subdomain}.localhost`,
        mobileDirectUrl: urls.directUrl,
        mobileWildcardUrl: urls.subdomainUrl,
        portalUrl: urls.portalUrl,
        instructions: "Use mobileDirectUrl or mobileWildcardUrl for testing on phones, tablets, or Smart TVs connected to the same Wi-Fi network.",
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    }

    if (name === "toggle_service_pause") {
      const subdomain = sanitizeSubdomain(String(args?.subdomain || ""));
      const enabled = Boolean(args?.enabled);

      const [updated] = await db
        .update(services)
        .set({ enabled, updatedAt: new Date() })
        .where(eq(services.hostname, subdomain))
        .returning();

      if (!updated) {
        return {
          content: [{ type: "text", text: `No service found with subdomain '${subdomain}'.` }],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Service '${subdomain}.localhost' is now ${enabled ? "resumed and active" : "paused (traffic paused with 503 fallback)"}.`,
          },
        ],
      };
    }

    if (name === "remove_port_route") {
      const subdomain = args?.subdomain ? sanitizeSubdomain(String(args.subdomain)) : null;
      const port = args?.port ? Number(args.port) : null;

      if (!subdomain && !port) {
        return {
          content: [
            {
              type: "text",
              text: "Error: Either 'subdomain' or 'port' must be provided to remove a route.",
            },
          ],
          isError: true,
        };
      }

      const conditions = [];
      if (subdomain) conditions.push(eq(services.hostname, subdomain));
      if (port) conditions.push(eq(services.port, port));

      const [removed] = await db
        .delete(services)
        .where(or(...conditions))
        .returning();

      if (!removed) {
        return {
          content: [
            {
              type: "text",
              text: `No matching route found for ${subdomain ? `subdomain '${subdomain}'` : `port ${port}`}.`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Successfully removed route '${removed.hostname}.localhost' for port ${removed.port}.`,
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Portside MCP Error: ${error?.message || String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Portside MCP Server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error starting Portside MCP Server:", err);
  process.exit(1);
});