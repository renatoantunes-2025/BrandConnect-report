import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/lib/types";
import { resolveAccountId } from "@/lib/resolveAccount";
import { PostsTable } from "./posts-table";

export default async function ClientPostsPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ account?: string }>;
}) {
  const { clientId } = await params;
  const { account: accountParam } = await searchParams;
  const supabase = await createClient();

  const accountId = await resolveAccountId(supabase, clientId, accountParam);

  if (!accountId) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Nenhuma conta social ainda — faça o primeiro upload na aba
        &quot;Contas &amp; Upload&quot;.
      </p>
    );
  }

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("social_account_id", accountId)
    .order("published_at", { ascending: false })
    .returns<Post[]>();

  return <PostsTable posts={posts ?? []} />;
}
