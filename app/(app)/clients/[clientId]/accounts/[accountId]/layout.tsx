import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Client, SocialAccount } from "@/lib/types";
import { AccountTabs } from "./account-tabs";

export default async function AccountLayout({
  children,
  params,
}: {
  children: React.ReactNode;
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

  return (
    <div className="flex flex-col gap-6">
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

      <AccountTabs clientId={clientId} accountId={accountId} />

      {children}
    </div>
  );
}
