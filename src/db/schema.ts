import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const mcpServers = sqliteTable("mcp_servers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  githubUrl: text("github_url"),
  registryId: text("registry_id").unique(),
  category: text("category"),
  language: text("language"),
  license: text("license"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const serverSnapshots = sqliteTable("server_snapshots", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  serverId: integer("server_id").notNull().references(() => mcpServers.id),
  stars: integer("stars"),
  openIssues: integer("open_issues"),
  openPrs: integer("open_prs"),
  contributors: integer("contributors"),
  lastCommitAt: text("last_commit_at"),
  releaseCount: integer("release_count"),
  dependencyCount: integer("dependency_count"),
  snapshotDate: text("snapshot_date").notNull(),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const crawlLogs = sqliteTable("crawl_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  status: text("status").notNull(), // "success" | "failure"
  serversFound: integer("servers_found"),
  serversUpdated: integer("servers_updated"),
  errorMessage: text("error_message"),
  startedAt: text("started_at").notNull(),
  finishedAt: text("finished_at"),
});
