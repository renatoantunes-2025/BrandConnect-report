import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Client, SocialAccount, Post } from "@/lib/types";

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

export default async function AccountReportPage({
  params,
}: {
  params: Promise<{ clientId: string; accountId: string }>;
}) {
  const { clientId, accountId } = await params;
  const supabase = await createClient();

  const { data: account } = await supabase
    .from("social_accounts")
    .select("*")
    .eq("id", accountId)
    .single<SocialAccount>();

  if (!account) notFound();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single<Client>();

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("social_account_id", accountId)
    .order("published_at", { ascending: false })
    .returns<Post[]>();

  const list = posts ?? [];

  const totals = list.reduce(
    (acc, post) => ({
      views: acc.views + post.views,
      reach: acc.reach + post.reach,
      likes: acc.likes + post.likes,
      shares: acc.shares + post.shares,
      comments: acc.comments + post.comments,
      saves: acc.saves + post.saves,
    }),
    { views: 0, reach: 0, likes: 0, shares: 0, comments: 0, saves: 0 }
  );

  const cards = [
    { label: "Posts", value: list.length },
    { label: "Visualizações", value: totals.views },
    { label: "Alcance", value: totals.reach },
    { label: "Curtidas", value: totals.likes },
    { label: "Comentários", value: totals.comments },
    { label: "Compartilhamentos", value: totals.shares },
    { label: "Salvamentos", value: totals.saves },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href={`/clients/${clientId}`}
          className="text-xs text-zinc-500 hover:underline dark:text-zinc-400"
        >
          ← {client?.name ?? "Cliente"}
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          @{account.username ?? account.external_account_id}
        </h1>
        <p className="text-sm capitalize text-zinc-500 dark:text-zinc-400">
          {account.platform}
        </p>
      </div>

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

      <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-zinc-100 text-xs uppercase text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              <th className="px-3 py-2">Publicado em</th>
              <th className="px-3 py-2">Tipo</th>
              <th className="px-3 py-2">Descrição</th>
              <th className="px-3 py-2 text-right">Visualizações</th>
              <th className="px-3 py-2 text-right">Alcance</th>
              <th className="px-3 py-2 text-right">Curtidas</th>
              <th className="px-3 py-2 text-right">Comentários</th>
              <th className="px-3 py-2 text-right">Compart.</th>
              <th className="px-3 py-2 text-right">Salvos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 bg-white dark:divide-white/5 dark:bg-zinc-950">
            {list.map((post) => (
              <tr key={post.id}>
                <td className="whitespace-nowrap px-3 py-2">
                  {formatDate(post.published_at)}
                </td>
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
                <td className="px-3 py-2 text-right">{formatNumber(post.views)}</td>
                <td className="px-3 py-2 text-right">{formatNumber(post.reach)}</td>
                <td className="px-3 py-2 text-right">{formatNumber(post.likes)}</td>
                <td className="px-3 py-2 text-right">{formatNumber(post.comments)}</td>
                <td className="px-3 py-2 text-right">{formatNumber(post.shares)}</td>
                <td className="px-3 py-2 text-right">{formatNumber(post.saves)}</td>
              </tr>
            ))}
            {list.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-3 py-6 text-center text-zinc-500 dark:text-zinc-400"
                >
                  Nenhum post ainda.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
