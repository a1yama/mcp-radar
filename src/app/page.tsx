import { db } from "@/db";
import { mcpServers, serverSnapshots } from "@/db/schema";
import { desc, eq, like, sql } from "drizzle-orm";
import { ServerCard } from "@/components/server-card";
import { SearchForm } from "@/components/search-form";

interface SearchParams {
  q?: string;
  lang?: string;
  sort?: string;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = params.q ?? "";
  const language = params.lang ?? "";
  const sort = params.sort ?? "stars";

  // Get latest snapshot for each server via subquery
  const latestSnapshots = db
    .select({
      serverId: serverSnapshots.serverId,
      maxId: sql<number>`MAX(${serverSnapshots.id})`.as("max_id"),
    })
    .from(serverSnapshots)
    .groupBy(serverSnapshots.serverId)
    .as("latest");

  let queryBuilder = db
    .select({
      id: mcpServers.id,
      name: mcpServers.name,
      description: mcpServers.description,
      githubUrl: mcpServers.githubUrl,
      language: mcpServers.language,
      license: mcpServers.license,
      stars: serverSnapshots.stars,
      openIssues: serverSnapshots.openIssues,
      lastCommitAt: serverSnapshots.lastCommitAt,
      contributors: serverSnapshots.contributors,
    })
    .from(mcpServers)
    .leftJoin(latestSnapshots, eq(latestSnapshots.serverId, mcpServers.id))
    .leftJoin(serverSnapshots, eq(serverSnapshots.id, latestSnapshots.maxId));

  const conditions = [];
  if (query) {
    conditions.push(like(mcpServers.name, `%${query}%`));
  }
  if (language) {
    conditions.push(eq(mcpServers.language, language));
  }

  if (conditions.length > 0) {
    queryBuilder = queryBuilder.where(
      conditions.length === 1
        ? conditions[0]
        : sql`${conditions[0]} AND ${conditions[1]}`
    ) as typeof queryBuilder;
  }

  const orderBy =
    sort === "updated"
      ? desc(serverSnapshots.lastCommitAt)
      : sort === "name"
        ? mcpServers.name
        : desc(serverSnapshots.stars);

  const servers = await queryBuilder.orderBy(orderBy).limit(100);

  // Get available languages for filter
  const languages = await db
    .selectDistinct({ language: mcpServers.language })
    .from(mcpServers)
    .where(sql`${mcpServers.language} IS NOT NULL`)
    .orderBy(mcpServers.language);

  const totalCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(mcpServers);

  return (
    <div>
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-bold">MCP Servers</h1>
        <p className="text-sm text-zinc-500">
          {totalCount[0].count} servers tracked from the official MCP Registry
        </p>
      </div>

      <SearchForm
        query={query}
        language={language}
        sort={sort}
        languages={languages
          .map((l) => l.language)
          .filter((l): l is string => l !== null)}
      />

      <div className="mt-6 grid gap-4">
        {servers.length === 0 ? (
          <p className="py-12 text-center text-zinc-500">
            No servers found matching your criteria.
          </p>
        ) : (
          servers.map((server) => (
            <ServerCard key={server.id} server={server} />
          ))
        )}
      </div>
    </div>
  );
}
