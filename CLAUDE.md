# CLAUDE.md — mcp-radar

## Overview

MCPサーバーのエコシステム動向を可視化するWebサービス。

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **DB**: Turso (SQLite) + drizzle-orm
- **Styling**: Tailwind CSS
- **Deploy**: Vercel

## Commands

```bash
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド
npm run lint         # ESLint実行
npx drizzle-kit push # DBスキーマ反映
npx drizzle-kit generate # マイグレーション生成
```

## Project Structure

```
src/
├── app/             # Next.js App Router
├── db/
│   ├── index.ts     # DB接続
│   └── schema.ts    # drizzle-ormスキーマ定義
├── lib/             # 共通ユーティリティ
└── components/      # UIコンポーネント
drizzle/             # マイグレーションファイル
```

## Conventions

- コミットメッセージは1行のみで簡潔に記述する
- コミットメッセージの形式: `git commit -m "簡潔なメッセージ"`
