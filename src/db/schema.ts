import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  varchar,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  tier: varchar("tier", { length: 32 }).default("free").notNull(),
  supporterSince: timestamp("supporter_since", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const projects = pgTable(
  "projects",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    description: text("description").default("").notNull(),
    color: varchar("color", { length: 32 }).default("indigo").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("projects_user_slug_idx").on(t.userId, t.slug)],
);

export const services = pgTable(
  "services",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: integer("project_id").references(() => projects.id, { onDelete: "set null" }),
    name: varchar("name", { length: 120 }).notNull(),
    hostname: varchar("hostname", { length: 120 }).notNull(),
    port: integer("port").notNull(),
    protocol: varchar("protocol", { length: 8 }).default("http").notNull(),
    description: text("description").default("").notNull(),
    icon: varchar("icon", { length: 16 }).default("🚀").notNull(),
    tags: text("tags").array().default([]).notNull(),
    favorite: boolean("favorite").default(false).notNull(),
    enabled: boolean("enabled").default(true).notNull(),
    lastStatus: varchar("last_status", { length: 16 }).default("unknown").notNull(),
    lastCheckedAt: timestamp("last_checked_at", { withTimezone: true }),
    lastLatencyMs: integer("last_latency_ms"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("services_hostname_idx").on(t.hostname),
    index("services_user_idx").on(t.userId),
    index("services_project_idx").on(t.projectId),
  ],
);

export const activityLogs = pgTable(
  "activity_logs",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    serviceId: integer("service_id").references(() => services.id, { onDelete: "set null" }),
    action: varchar("action", { length: 40 }).notNull(),
    message: text("message").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("activity_user_idx").on(t.userId, t.createdAt)],
);

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  services: many(services),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
  services: many(services),
}));

export const servicesRelations = relations(services, ({ one }) => ({
  user: one(users, { fields: [services.userId], references: [users.id] }),
  project: one(projects, { fields: [services.projectId], references: [projects.id] }),
}));

export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Service = typeof services.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
