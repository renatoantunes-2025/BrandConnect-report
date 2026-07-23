"use client";

import { useMemo, useState } from "react";
import type { Post } from "@/lib/types";

type SortKey =
  | "published_at"
  | "views"
  | "reach"
  | "likes"
  | "comments"
  | "shares"
  | "saves";

const PAGE_SIZES = [25, 50, 100] as const;

const COLUMNS: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "published_at", label: "Publicado em" },
  { key: "views", label: "Visualizações", align: "right" },
  { key: "reach", label: "Alcance", align: "right" },
  { key: "likes", label: "Curtidas", align: "right" },
  { key: "comments", label: "Comentários", align: "right" },
  { key: "shares", label: "Compart.", align: "right" },
  { key: "saves", label: "Salvos", align: "right" },
];

function formatNumber(n: number) {
  return new Intl.NumberFormat("pt-BR").format(n);
}

function formatDate(iso: string | null) {
  if (!iso) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

export function PostsTable({ posts }: { posts: Post[] }) {
  const [search, setSearch] = useState("");
  const [postType, setPostType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("published_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(25);

  const postTypes = useMemo(() => {
    const types = new Set<string>();
    for (const post of posts) {
      if (post.post_type) types.add(post.post_type);
    }
    return Array.from(types).sort();
  }, [posts]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;

    return posts.filter((post) => {
      if (term && !(post.description ?? "").toLowerCase().includes(term)) {
        return false;
      }
      if (postType !== "all" && post.post_type !== postType) {
        return false;
      }
      if (post.published_at) {
        const published = new Date(post.published_at);
        if (from && published < from) return false;
        if (to && published > to) return false;
      } else if (from || to) {
        return false;
      }
      return true;
    });
  }, [posts, search, postType, dateFrom, dateTo]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let diff: number;
      if (sortKey === "published_at") {
        const aTime = a.published_at ? new Date(a.published_at).getTime() : 0;
        const bTime = b.published_at ? new Date(b.published_at).getTime() : 0;
        diff = aTime - bTime;
      } else {
        diff = a[sortKey] - b[sortKey];
      }
      return sortDir === "asc" ? diff : -diff;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  const totals = useMemo(
    () =>
      filtered.reduce(
        (acc, post) => ({
          views: acc.views + post.views,
          reach: acc.reach + post.reach,
          likes: acc.likes + post.likes,
          shares: acc.shares + post.shares,
          comments: acc.comments + post.comments,
          saves: acc.saves + post.saves,
        }),
        { views: 0, reach: 0, likes: 0, shares: 0, comments: 0, saves: 0 }
      ),
    [filtered]
  );

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageItems = sorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const hasFilters =
    search !== "" || postType !== "all" || dateFrom !== "" || dateTo !== "";

  function resetPage() {
    setPage(1);
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function clearFilters() {
    setSearch("");
    setPostType("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  const cards = [
    { label: "Posts", value: filtered.length },
    { label: "Visualizações", value: totals.views },
    { label: "Alcance", value: totals.reach },
    { label: "Curtidas", value: totals.likes },
    { label: "Comentários", value: totals.comments },
    { label: "Compartilhamentos", value: totals.shares },
    { label: "Salvamentos", value: totals.saves },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-zinc-900"
          >
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{card.label}</p>
            <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {formatNumber(card.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-zinc-900">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500 dark:text-zinc-400">Buscar</label>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPage();
            }}
            placeholder="Texto da descrição…"
            className="w-56 rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500 dark:text-zinc-400">Tipo de post</label>
          <select
            value={postType}
            onChange={(e) => {
              setPostType(e.target.value);
              resetPage();
            }}
            className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="all">Todos</option>
            {postTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500 dark:text-zinc-400">De</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              resetPage();
            }}
            className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500 dark:text-zinc-400">Até</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              resetPage();
            }}
            className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>

        {hasFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-md px-2 py-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Limpar filtros
          </button>
        ) : null}
      </div>

      <div className="max-h-[70vh] overflow-auto rounded-lg border border-black/10 dark:border-white/10">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-zinc-100 text-xs uppercase text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-2 ${col.align === "right" ? "text-right" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSort(col.key)}
                    className="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-50"
                  >
                    {col.label}
                    {sortKey === col.key ? (sortDir === "asc" ? "↑" : "↓") : null}
                  </button>
                </th>
              ))}
              <th className="px-3 py-2">Tipo</th>
              <th className="px-3 py-2">Descrição</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 bg-white dark:divide-white/5 dark:bg-zinc-950">
            {pageItems.map((post) => (
              <tr key={post.id}>
                <td className="whitespace-nowrap px-3 py-2">
                  {formatDate(post.published_at)}
                </td>
                <td className="px-3 py-2 text-right">{formatNumber(post.views)}</td>
                <td className="px-3 py-2 text-right">{formatNumber(post.reach)}</td>
                <td className="px-3 py-2 text-right">{formatNumber(post.likes)}</td>
                <td className="px-3 py-2 text-right">{formatNumber(post.comments)}</td>
                <td className="px-3 py-2 text-right">{formatNumber(post.shares)}</td>
                <td className="px-3 py-2 text-right">{formatNumber(post.saves)}</td>
                <td className="whitespace-nowrap px-3 py-2">{post.post_type}</td>
                <td
                  className="max-w-xs truncate px-3 py-2"
                  title={post.description ?? ""}
                >
                  {post.permalink ? (
                    <a
                      href={post.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {post.description?.split("\n")[0] || "(sem descrição)"}
                    </a>
                  ) : (
                    post.description?.split("\n")[0] || "(sem descrição)"
                  )}
                </td>
              </tr>
            ))}
            {pageItems.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNS.length + 2}
                  className="px-3 py-6 text-center text-zinc-500 dark:text-zinc-400"
                >
                  Nenhum post encontrado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-500 dark:text-zinc-400">
        <p>{filtered.length} posts encontrados</p>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5">
            Por página
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                resetPage();
              }}
              className="rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-md border border-zinc-300 px-2 py-1 disabled:opacity-40 dark:border-zinc-700"
          >
            ← Anterior
          </button>
          <span>
            Página {currentPage} de {pageCount}
          </span>
          <button
            type="button"
            disabled={currentPage >= pageCount}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            className="rounded-md border border-zinc-300 px-2 py-1 disabled:opacity-40 dark:border-zinc-700"
          >
            Próxima →
          </button>
        </div>
      </div>
    </div>
  );
}
