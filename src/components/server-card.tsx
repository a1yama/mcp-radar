interface ServerCardProps {
  server: {
    id: number;
    name: string;
    description: string | null;
    githubUrl: string | null;
    language: string | null;
    license: string | null;
    stars: number | null;
    openIssues: number | null;
    lastCommitAt: string | null;
    contributors: number | null;
  };
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export function ServerCard({ server }: ServerCardProps) {
  return (
    <a
      href={`/servers/${server.id}`}
      className="block rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold">{server.name}</h2>
          {server.description && (
            <p className="mt-1 line-clamp-1 text-sm text-zinc-500">
              {server.description}
            </p>
          )}
        </div>
        {server.stars !== null && (
          <span className="flex shrink-0 items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400">
            <StarIcon />
            {server.stars.toLocaleString()}
          </span>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-500">
        {server.language && (
          <span className="flex items-center gap-1">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: languageColor(server.language) }}
            />
            {server.language}
          </span>
        )}
        {server.license && <span>{server.license}</span>}
        {server.openIssues !== null && server.openIssues > 0 && (
          <span>{server.openIssues} issues</span>
        )}
        {server.lastCommitAt && (
          <span>Updated {timeAgo(server.lastCommitAt)}</span>
        )}
      </div>
    </a>
  );
}

function StarIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function languageColor(lang: string): string {
  const colors: Record<string, string> = {
    TypeScript: "#3178c6",
    JavaScript: "#f1e05a",
    Python: "#3572a5",
    Go: "#00add8",
    Rust: "#dea584",
    Java: "#b07219",
    "C#": "#178600",
    Ruby: "#701516",
    PHP: "#4F5D95",
    Swift: "#F05138",
    Kotlin: "#A97BFF",
    HTML: "#e34c26",
  };
  return colors[lang] ?? "#6b7280";
}
