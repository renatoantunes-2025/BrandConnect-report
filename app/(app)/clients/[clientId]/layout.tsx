import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Client, SocialAccount } from "@/lib/types";
import { ClientTabs } from "./client-tabs";
import { AccountSwitcher } from "./account-switcher";

export default async function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
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
    .order("created_at", { ascending: true })
    .returns<SocialAccount[]>();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
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

        <AccountSwitcher accounts={accounts ?? []} />
      </div>

      <ClientTabs clientId={client.id} />

      {children}
    </div>
  );
}
