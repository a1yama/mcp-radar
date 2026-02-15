const GITHUB_API_URL = "https://api.github.com";

interface GitHubRepoData {
  stargazers_count: number;
  open_issues_count: number;
  license: { spdx_id: string } | null;
  language: string | null;
  pushed_at: string;
  topics: string[];
}

export interface GitHubMetadata {
  stars: number;
  openIssues: number;
  license: string | null;
  language: string | null;
  lastCommitAt: string;
  contributors: number;
  releaseCount: number;
}

function parseOwnerRepo(githubUrl: string): { owner: string; repo: string } | null {
  const match = githubUrl.match(/github\.com\/([\w.-]+)\/([\w.-]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

async function githubFetch(path: string, token?: string): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${GITHUB_API_URL}${path}`, { headers });
  if (res.status === 403 || res.status === 429) {
    const resetAt = res.headers.get("x-ratelimit-reset");
    throw new Error(
      `GitHub rate limit exceeded. Resets at: ${resetAt ? new Date(Number(resetAt) * 1000).toISOString() : "unknown"}`
    );
  }
  return res;
}

export async function fetchGitHubMetadata(
  githubUrl: string,
  token?: string
): Promise<GitHubMetadata | null> {
  const parsed = parseOwnerRepo(githubUrl);
  if (!parsed) return null;

  const { owner, repo } = parsed;

  const repoRes = await githubFetch(`/repos/${owner}/${repo}`, token);
  if (!repoRes.ok) return null;
  const repoData: GitHubRepoData = await repoRes.json();

  // Contributors count (use first page header)
  let contributors = 0;
  const contribRes = await githubFetch(
    `/repos/${owner}/${repo}/contributors?per_page=1&anon=false`,
    token
  );
  if (contribRes.ok) {
    const linkHeader = contribRes.headers.get("link");
    if (linkHeader) {
      const lastMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
      contributors = lastMatch ? Number(lastMatch[1]) : 1;
    } else {
      const contribData = await contribRes.json();
      contributors = Array.isArray(contribData) ? contribData.length : 0;
    }
  }

  // Release count
  let releaseCount = 0;
  const releaseRes = await githubFetch(
    `/repos/${owner}/${repo}/releases?per_page=1`,
    token
  );
  if (releaseRes.ok) {
    const linkHeader = releaseRes.headers.get("link");
    if (linkHeader) {
      const lastMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
      releaseCount = lastMatch ? Number(lastMatch[1]) : 1;
    } else {
      const releaseData = await releaseRes.json();
      releaseCount = Array.isArray(releaseData) ? releaseData.length : 0;
    }
  }

  return {
    stars: repoData.stargazers_count,
    openIssues: repoData.open_issues_count,
    license: repoData.license?.spdx_id ?? null,
    language: repoData.language,
    lastCommitAt: repoData.pushed_at,
    contributors,
    releaseCount,
  };
}
