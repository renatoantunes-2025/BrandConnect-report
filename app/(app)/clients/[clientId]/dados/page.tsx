import { createClient } from "@/lib/supabase/server";
import type { EditorialPost } from "@/lib/types";
import { ImportedPostsTable } from "./imported-posts-table";

export default async function ClientDataPage({
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

  return <ImportedPostsTable posts={posts ?? []} />;
}
