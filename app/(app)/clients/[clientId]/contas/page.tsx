import { createClient } from "@/lib/supabase/server";
import type { SocialAccount } from "@/lib/types";
import { UploadForm } from "../upload-form";
import { AccountList } from "../account-list";

export default async function ClientAccountsPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const supabase = await createClient();

  const { data: accounts } = await supabase
    .from("social_accounts")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at")
    .returns<SocialAccount[]>();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Contas sociais
        </h2>
        <AccountList accounts={accounts ?? []} clientId={clientId} />
      </div>

      <UploadForm clientId={clientId} accounts={accounts ?? []} />
    </div>
  );
}
