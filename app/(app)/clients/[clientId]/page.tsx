import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Client, SocialAccount } from "@/lib/types";
import { UploadForm } from "./upload-form";

export default async function ClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single<Client>();

  if (!client) notFound();

  const { data: accounts } = await supabase
    .from("social_accounts")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at")
    .returns<SocialAccount[]>();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/dashboard"
          className="text-xs text-zinc-500 hover:underline dark:text-zinc-400"
        >
          ← Clientes
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {client.name}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Contas sociais
          </h2>
          {accounts && accounts.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {accounts.map((account) => (
                <li key={account.id}>
                  <Link
                    href={`/clients/${client.id}/accounts/${account.id}`}
                    className="flex items-center justify-between rounded-lg border border-black/10 bg-white p-4 shadow-sm transition-colors hover:border-zinc-400 dark:border-white/10 dark:bg-zinc-900"
                  >
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-50">
                        @{account.username ?? account.external_account_id}
                      </p>
                      <p className="text-xs capitalize text-zinc-500 dark:text-zinc-400">
                        {account.platform}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Nenhuma conta ainda — faça o primeiro upload ao lado.
            </p>
          )}
        </div>

        <UploadForm clientId={client.id} />
      </div>
    </div>
  );
}
