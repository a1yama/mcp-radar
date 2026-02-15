import { db } from "@/db";
import { mcpServers, serverSnapshots } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const server = await db.query.mcpServers.findFirst({
    where: eq(mcpServers.id, Number(id)),
  });

  if (!server) return { title: "Not Found" };

  return {
    title: `${server.name} | mcp-radar`,
    description: server.description ?? `MCP Server: ${server.name}`,
  };
}

export default async function ServerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const server = await db.query.mcpServers.findFirst({
    where: eq(mcpServers.id, Number(id)),
  });

  if (!server) notFound();

  const snapshots = await db
    .select()
    .from(serverSnapshots)
    .where(eq(serverSnapshots.serverId, server.id))
    .orderBy(desc(serverSnapshots.snapshotDate))
    .limit(30);

  const latest = snapshots[0] ?? null;

  return (
    <div>
      <a
        href="/"
        className="mb-4 inline-block text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        &larr; Back to list
      </a>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">{server.name}</h1>
        {server.description && (
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            {server.description}
          </p>
        )}
      </div>

      {/* Metadata */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard label="Stars" value={latest?.stars?.toLocaleString() ?? "-"} />
        <MetricCard label="Open Issues" value={latest?.openIssues?.toLocaleString() ?? "-"} />
        <MetricCard label="Contributors" value={latest?.contributors?.toLocaleString() ?? "-"} />
        <MetricCard label="Releases" value={latest?.releaseCount?.toLocaleString() ?? "-"} />
      </div>

      {/* Info table */}
      <div className="mb-6 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <tbody>
            <InfoRow label="Language" value={server.language} />
            <InfoRow label="License" value={server.license} />
            <InfoRow
              label="Last Commit"
              value={latest?.lastCommitAt ? new Date(latest.lastCommitAt).toLocaleDateString("ja-JP") : null}
            />
            <InfoRow label="Registry ID" value={server.registryId} />
            {server.githubUrl && (
              <tr className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-2 font-medium text-zinc-500">GitHub</td>
                <td className="px-4 py-2">
                  <a
                    href={server.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {server.githubUrl}
                  </a>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Snapshot history */}
      {snapshots.length > 1 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Snapshot History</h2>
          <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                  <th className="px-4 py-2 text-left font-medium">Date</th>
                  <th className="px-4 py-2 text-right font-medium">Stars</th>
                  <th className="px-4 py-2 text-right font-medium">Issues</th>
                  <th className="px-4 py-2 text-right font-medium">Contributors</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((s) => (
                  <tr
                    key={s.id}
                    className="border-t border-zinc-200 dark:border-zinc-800"
                  >
                    <td className="px-4 py-2">{s.snapshotDate}</td>
                    <td className="px-4 py-2 text-right">{s.stars?.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">{s.openIssues}</td>
                    <td className="px-4 py-2 text-right">{s.contributors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <tr className="border-t border-zinc-200 dark:border-zinc-800">
      <td className="px-4 py-2 font-medium text-zinc-500">{label}</td>
      <td className="px-4 py-2">{value}</td>
    </tr>
  );
}
