"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  parseInstagramExport,
  parsePeriodFromFileName,
} from "@/lib/csv/parseInstagramExport";

export async function uploadReport(clientId: string, formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecione um arquivo CSV." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let parsed;
  try {
    parsed = parseInstagramExport(buffer);
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Falha ao processar o arquivo.",
    };
  }

  const periodFromName = parsePeriodFromFileName(file.name);
  const periodStart =
    String(formData.get("period_start") ?? "").trim() || periodFromName?.start || null;
  const periodEnd =
    String(formData.get("period_end") ?? "").trim() || periodFromName?.end || null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: account, error: accountError } = await supabase
    .from("social_accounts")
    .upsert(
      {
        client_id: clientId,
        platform: "instagram",
        external_account_id: parsed.account.externalAccountId,
        username: parsed.account.username,
        display_name: parsed.account.displayName,
      },
      { onConflict: "client_id,platform,external_account_id" }
    )
    .select()
    .single();

  if (accountError || !account) {
    return { error: "Não foi possível salvar a conta social." };
  }

  const { data: upload, error: uploadError } = await supabase
    .from("report_uploads")
    .insert({
      social_account_id: account.id,
      uploaded_by: user?.id ?? null,
      file_name: file.name,
      period_start: periodStart,
      period_end: periodEnd,
      row_count: parsed.posts.length,
    })
    .select()
    .single();

  if (uploadError || !upload) {
    return { error: "Não foi possível registrar o upload." };
  }

  const rows = parsed.posts.map((post) => ({
    social_account_id: account.id,
    upload_id: upload.id,
    external_post_id: post.externalPostId,
    description: post.description,
    post_type: post.postType,
    duration_seconds: post.durationSeconds,
    permalink: post.permalink,
    published_at: post.publishedAt,
    views: post.views,
    reach: post.reach,
    likes: post.likes,
    shares: post.shares,
    follows: post.follows,
    comments: post.comments,
    saves: post.saves,
    updated_at: new Date().toISOString(),
  }));

  const { error: postsError } = await supabase
    .from("posts")
    .upsert(rows, { onConflict: "social_account_id,external_post_id" });

  if (postsError) {
    return { error: "Não foi possível salvar os posts do relatório." };
  }

  revalidatePath(`/clients/${clientId}`);
  redirect(`/clients/${clientId}/accounts/${account.id}`);
}
