const REGISTRY_BASE_URL = "https://registry.modelcontextprotocol.io/v0.1";

interface RegistryServer {
  server: {
    name: string;
    description?: string;
    repository?: {
      url: string;
      source?: string;
    };
    version?: string;
    packages?: Array<{
      registryType?: string;
      identifier?: string;
      transport?: {
        type?: string;
      };
    }>;
  };
  _meta?: {
    "io.modelcontextprotocol.registry/official"?: {
      status?: string;
      publishedAt?: string;
      updatedAt?: string;
      isLatest?: boolean;
    };
  };
}

interface RegistryResponse {
  servers: RegistryServer[];
  metadata: {
    nextCursor?: string;
    count: number;
  };
}

export interface ParsedServer {
  name: string;
  description: string | null;
  githubUrl: string | null;
  registryId: string;
  version: string | null;
  publishedAt: string | null;
  updatedAt: string | null;
}

function extractGithubUrl(repositoryUrl?: string): string | null {
  if (!repositoryUrl) return null;
  const match = repositoryUrl.match(/github\.com\/[\w.-]+\/[\w.-]+/);
  return match ? `https://${match[0]}` : null;
}

async function fetchPage(cursor?: string): Promise<RegistryResponse> {
  const params = new URLSearchParams({ version: "latest" });
  if (cursor) params.set("cursor", cursor);

  const res = await fetch(`${REGISTRY_BASE_URL}/servers?${params}`);
  if (!res.ok) {
    throw new Error(`Registry API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function fetchAllServers(): Promise<ParsedServer[]> {
  const servers: ParsedServer[] = [];
  let cursor: string | undefined;

  do {
    const response = await fetchPage(cursor);

    for (const entry of response.servers) {
      const meta = entry._meta?.["io.modelcontextprotocol.registry/official"];
      servers.push({
        name: entry.server.name,
        description: entry.server.description ?? null,
        githubUrl: extractGithubUrl(entry.server.repository?.url),
        registryId: entry.server.name,
        version: entry.server.version ?? null,
        publishedAt: meta?.publishedAt ?? null,
        updatedAt: meta?.updatedAt ?? null,
      });
    }

    cursor = response.metadata.nextCursor;
  } while (cursor);

  return servers;
}
