"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface SearchFormProps {
  query: string;
  language: string;
  sort: string;
  languages: string[];
}

export function SearchForm({
  query,
  language,
  sort,
  languages,
}: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap gap-3">
      <input
        type="text"
        placeholder="Search servers..."
        defaultValue={query}
        onChange={(e) => {
          const timeout = setTimeout(() => {
            updateParams("q", e.target.value);
          }, 300);
          return () => clearTimeout(timeout);
        }}
        className="h-10 flex-1 rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-500"
      />
      <select
        value={language}
        onChange={(e) => updateParams("lang", e.target.value)}
        className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      >
        <option value="">All Languages</option>
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
      <select
        value={sort}
        onChange={(e) => updateParams("sort", e.target.value)}
        className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      >
        <option value="stars">Stars</option>
        <option value="updated">Last Updated</option>
        <option value="name">Name</option>
      </select>
    </div>
  );
}
