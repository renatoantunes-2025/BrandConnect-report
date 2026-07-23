import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/lib/types";
import { PostsTable } from "../posts-table";

export default async function AccountPostsPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("social_account_id", accountId)
    .order("published_at", { ascending: false })
    .returns<Post[]>();

  return <PostsTable posts={posts ?? []} />;
}
