# mcp-radar

MCPサーバーのエコシステム動向を可視化するWebサービス。

公式MCP RegistryやGitHubから情報を自動収集し、MCPサーバーの更新頻度・Star推移・メンテナンス状況などを一覧・検索できます。

## Features (MVP)

- MCP Registryからサーバー一覧を自動取得
- GitHubメタデータ（Star数、最終更新、Issue数等）の日次収集
- カテゴリ別・言語別・更新頻度別のフィルター＋検索
- 各サーバーの詳細ページ（指標サマリ、READMEプレビュー）

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- [Turso](https://turso.tech/) (SQLite)
- [drizzle-orm](https://orm.drizzle.team/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel](https://vercel.com/)

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Turso and GitHub credentials

# Push DB schema
npx drizzle-kit push

# Start dev server
npm run dev
```

## License

MIT
