import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Resolve qual conta social usar numa página do cliente: a informada via
 * `?account=` se for válida e pertencer ao cliente, senão a primeira
 * cadastrada. `null` quando o cliente ainda não tem nenhuma conta.
 */
export async function resolveAccountId(
  supabase: SupabaseServerClient,
  clientId: string,
  requested: string | undefined
): Promise<string | null> {
  if (requested) {
    const { data } = await supabase
      .from("social_accounts")
      .select("id")
      .eq("id", requested)
      .eq("client_id", clientId)
      .maybeSingle();
    if (data) return data.id;
  }

  const { data } = await supabase
    .from("social_accounts")
    .select("id")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return data?.id ?? null;
}
