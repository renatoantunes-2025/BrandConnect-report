"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { EditorialPost } from "@/lib/types";
import {
  FORMAT_OPTIONS,
  computeEngagementRate,
  computeInteractions,
  deriveFormat,
  formatMonthLabel,
} from "@/lib/editorial";

type EditablePatch = Partial<
  Pick<
    EditorialPost,
    | "format"
    | "product_theme"
    | "category"
    | "is_repost"
    | "profile_visits"
    | "link_clicks"
    | "notes"
  >
>;

type Status = "idle" | "saving" | "saved" | "error";

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

const inputClass =
  "w-full rounded-md border border-transparent bg-transparent px-2 py-1 text-sm hover:border-zinc-300 focus:border-zinc-500 focus:bg-white focus:outline-none dark:hover:border-zinc-700 dark:focus:bg-zinc-950";

function StatusDot({ status }: { status: Status }) {
  if (status === "saving") return <span className="text-zinc-400" title="Salvando…">…</span>;
  if (status === "saved") return <span className="text-green-600 dark:text-green-400" title="Salvo">✓</span>;
  if (status === "error") return <span className="text-red-600 dark:text-red-400" title="Erro ao salvar">⚠</span>;
  return <span className="text-transparent">·</span>;
}

export function EditorialSheet({ posts }: { posts: EditorialPost[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState(posts);
  const [status, setStatus] = useState<Record<string, Status>>({});

  const themeSuggestions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.product_theme).filter(Boolean))) as string[],
    [rows]
  );
  const categorySuggestions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.category).filter(Boolean))) as string[],
    [rows]
  );

  async function saveField(postId: string, patch: EditablePatch) {
    setStatus((s) => ({ ...s, [postId]: "saving" }));
    const { error } = await supabase.from("posts").update(patch).eq("id", postId);
    if (error) {
      setStatus((s) => ({ ...s, [postId]: "error" }));
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === postId ? { ...r, ...patch } : r)));
    setStatus((s) => ({ ...s, [postId]: "saved" }));
    setTimeout(() => setStatus((s) => ({ ...s, [postId]: "idle" })), 2000);
  }

  if (rows.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Nenhum post encontrado ainda — faça upload de um relatório primeiro.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <datalist id="theme-options">
        {themeSuggestions.map((value) => (
          <option key={value} value={value} />
        ))}
      </datalist>
      <datalist id="category-options">
        {categorySuggestions.map((value) => (
          <option key={value} value={value} />
        ))}
      </datalist>

      <div className="max-h-[75vh] overflow-auto rounded-lg border border-black/10 dark:border-white/10">
        <table className="w-full min-w-[1700px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-zinc-100 text-xs uppercase text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              <th className="w-6 px-1 py-2" />
              <th className="px-3 py-2">Data</th>
              <th className="px-3 py-2">Mês</th>
              <th className="px-3 py-2">Rede Social</th>
              <th className="px-3 py-2">Formato</th>
              <th className="px-3 py-2">Produto / Tema</th>
              <th className="px-3 py-2">Categoria</th>
              <th className="px-3 py-2">Caption (resumo)</th>
              <th className="px-3 py-2 text-right">Alcance</th>
              <th className="px-3 py-2 text-right">Impressões</th>
              <th className="px-3 py-2 text-right">Interações</th>
              <th className="px-3 py-2 text-right">Curtidas</th>
              <th className="px-3 py-2 text-right">Comentários</th>
              <th className="px-3 py-2 text-right">Compart.</th>
              <th className="px-3 py-2 text-right">Salvos</th>
              <th className="px-3 py-2">Repost</th>
              <th className="px-3 py-2 text-right">Tx. Engaj. (%)</th>
              <th className="px-3 py-2 text-right">Visitas Perfil</th>
              <th className="px-3 py-2 text-right">Cliques Link</th>
              <th className="px-3 py-2">Observações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 bg-white dark:divide-white/5 dark:bg-zinc-950">
            {rows.map((post) => {
              const rowStatus = status[post.id] ?? "idle";
              const format = post.format || deriveFormat(post.post_type);
              const formatOptions = FORMAT_OPTIONS.includes(
                format as (typeof FORMAT_OPTIONS)[number]
              )
                ? FORMAT_OPTIONS
                : ([format, ...FORMAT_OPTIONS] as const);

              return (
                <tr key={post.id}>
                  <td className="px-1 py-1 text-center">
                    <StatusDot status={rowStatus} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-1">
                    {formatDate(post.published_at)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-1">
                    {formatMonthLabel(post.published_at)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-1 capitalize">
                    {post.social_accounts.platform}
                  </td>
                  <td className="px-1 py-1">
                    <select
                      value={format}
                      onChange={(e) => saveField(post.id, { format: e.target.value })}
                      className={inputClass}
                    >
                      {formatOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-1 py-1">
                    <input
                      list="theme-options"
                      defaultValue={post.product_theme ?? ""}
                      onBlur={(e) =>
                        saveField(post.id, { product_theme: e.target.value.trim() || null })
                      }
                      className={inputClass}
                      placeholder="—"
                    />
                  </td>
                  <td className="px-1 py-1">
                    <input
                      list="category-options"
                      defaultValue={post.category ?? ""}
                      onBlur={(e) =>
                        saveField(post.id, { category: e.target.value.trim() || null })
                      }
                      className={inputClass}
                      placeholder="—"
                    />
                  </td>
                  <td className="max-w-xs truncate px-3 py-1" title={post.description ?? ""}>
                    {post.description?.split("\n")[0] || "(sem descrição)"}
                  </td>
                  <td className="px-3 py-1 text-right">{formatNumber(post.reach)}</td>
                  <td className="px-3 py-1 text-right">{formatNumber(post.views)}</td>
                  <td className="px-3 py-1 text-right">{formatNumber(computeInteractions(post))}</td>
                  <td className="px-3 py-1 text-right">{formatNumber(post.likes)}</td>
                  <td className="px-3 py-1 text-right">{formatNumber(post.comments)}</td>
                  <td className="px-3 py-1 text-right">{formatNumber(post.shares)}</td>
                  <td className="px-3 py-1 text-right">{formatNumber(post.saves)}</td>
                  <td className="px-1 py-1">
                    <select
                      value={post.is_repost ? "true" : "false"}
                      onChange={(e) =>
                        saveField(post.id, { is_repost: e.target.value === "true" })
                      }
                      className={inputClass}
                    >
                      <option value="false">Não</option>
                      <option value="true">Sim</option>
                    </select>
                  </td>
                  <td className="px-3 py-1 text-right">
                    {computeEngagementRate(post).toFixed(1)}%
                  </td>
                  <td className="px-1 py-1">
                    <input
                      type="number"
                      inputMode="numeric"
                      defaultValue={post.profile_visits ?? ""}
                      onBlur={(e) => {
                        const raw = e.target.value.trim();
                        const value = raw === "" ? null : Number(raw);
                        if (value !== null && Number.isNaN(value)) return;
                        saveField(post.id, { profile_visits: value });
                      }}
                      className={`${inputClass} text-right`}
                      placeholder="—"
                    />
                  </td>
                  <td className="px-1 py-1">
                    <input
                      type="number"
                      inputMode="numeric"
                      defaultValue={post.link_clicks ?? ""}
                      onBlur={(e) => {
                        const raw = e.target.value.trim();
                        const value = raw === "" ? null : Number(raw);
                        if (value !== null && Number.isNaN(value)) return;
                        saveField(post.id, { link_clicks: value });
                      }}
                      className={`${inputClass} text-right`}
                      placeholder="—"
                    />
                  </td>
                  <td className="px-1 py-1">
                    <input
                      defaultValue={post.notes ?? ""}
                      onBlur={(e) => saveField(post.id, { notes: e.target.value.trim() || null })}
                      className={`${inputClass} min-w-[200px]`}
                      placeholder="Escreva aqui…"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
