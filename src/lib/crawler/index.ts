import { db } from "@/db";
import { mcpServers, serverSnapshots, crawlLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { fetchAllServers } from "./registry";
import { fetchGitHubMetadata } from "./github";

export async function runCrawl(options?: { limit?: number }): Promise<{
  serversFound: number;
  serversUpdated: number;
}> {
  const startedAt = new Date().toISOString();
  const today = new Date().toISOString().split("T")[0];
  const githubToken = process.env.GITHUB_TOKEN;

  try {
    let registryServers = await fetchAllServers();
    console.log(`Registry: ${registryServers.length} servers found`);

    if (options?.limit) {
      registryServers = registryServers.slice(0, options.limit);
      console.log(`Limited to ${options.limit} servers`);
    }

    let serversUpdated = 0;

    for (let i = 0; i < registryServers.length; i++) {
      const server = registryServers[i];
      console.log(`[${i + 1}/${registryServers.length}] ${server.name}`);

      // Upsert server
      const existing = await db.query.mcpServers.findFirst({
        where: eq(mcpServers.registryId, server.registryId),
      });

      let serverId: number;

      if (existing) {
        await db
          .update(mcpServers)
          .set({
            name: server.name,
            description: server.description,
            githubUrl: server.githubUrl,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(mcpServers.id, existing.id));
        serverId = existing.id;
      } else {
        const result = await db
          .insert(mcpServers)
          .values({
            name: server.name,
            description: server.description,
            githubUrl: server.githubUrl,
            registryId: server.registryId,
          })
          .returning({ id: mcpServers.id });
        serverId = result[0].id;
      }

      // Fetch GitHub metadata if URL available
      if (server.githubUrl) {
        let metadata;
        try {
          metadata = await fetchGitHubMetadata(server.githubUrl, githubToken);
        } catch (e) {
          console.warn(`  GitHub fetch failed: ${e instanceof Error ? e.message : e}`);
          continue;
        }
        if (metadata) {
          await db
            .update(mcpServers)
            .set({
              language: metadata.language,
              license: metadata.license,
            })
            .where(eq(mcpServers.id, serverId));

          await db.insert(serverSnapshots).values({
            serverId,
            stars: metadata.stars,
            openIssues: metadata.openIssues,
            contributors: metadata.contributors,
            lastCommitAt: metadata.lastCommitAt,
            releaseCount: metadata.releaseCount,
            snapshotDate: today,
          });

          serversUpdated++;
          console.log(`  -> stars:${metadata.stars} issues:${metadata.openIssues} lang:${metadata.language}`);
        }
      } else {
        console.log(`  -> No GitHub URL, skipped`);
      }
    }

    await db.insert(crawlLogs).values({
      status: "success",
      serversFound: registryServers.length,
      serversUpdated,
      startedAt,
      finishedAt: new Date().toISOString(),
    });

    return { serversFound: registryServers.length, serversUpdated };
  } catch (error) {
    await db.insert(crawlLogs).values({
      status: "failure",
      errorMessage: error instanceof Error ? error.message : String(error),
      startedAt,
      finishedAt: new Date().toISOString(),
    });
    throw error;
  }
}
