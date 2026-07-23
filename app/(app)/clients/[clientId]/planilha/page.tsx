import { createClient } from "@/lib/supabase/server";
import type { EditorialPost } from "@/lib/types";
import { EditorialSheet } from "./editorial-sheet";

export default async function EditorialSheetPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("posts")
    .select("*, social_accounts!inner(platform, username)")
    .eq("social_accounts.client_id", clientId)
    .order("published_at", { ascending: false })
    .returns<EditorialPost[]>();

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Classifique os posts de todas as redes sociais deste cliente.
      </p>

      <EditorialSheet posts={posts ?? []} />
    </div>
  );
}
