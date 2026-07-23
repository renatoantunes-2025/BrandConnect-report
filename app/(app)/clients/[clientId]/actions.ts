"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  parseInstagramExport,
  parsePeriodFromFileName,
} from "@/lib/csv/parseInstagramExport";
import { detectFileKind } from "@/lib/csv/detectFileKind";
import { decodeUtf16File } from "@/lib/csv/fileEncoding";
import { parseFollowersExport } from "@/lib/csv/parseFollowersExport";
import { parseAudienceExport } from "@/lib/csv/parseAudienceExport";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;
type ActionResult = { error: string | null };

export async function uploadReport(
  clientId: string,
  formData: FormData
): Promise<ActionResult> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecione um arquivo CSV." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const selectedAccountId =
    String(formData.get("social_account_id") ?? "").trim() || null;
  const kind = detectFileKind(buffer);

  const supabase = await createClient();

  if (selectedAccountId) {
    const { data: account } = await supabase
      .from("social_accounts")
      .select("id, client_id")
      .eq("id", selectedAccountId)
      .single();
    if (!account || account.client_id !== clientId) {
      return { error: "Conta social inválida." };
    }
  }

  if (kind === "followers") {
    if (!selectedAccountId) {
      return { error: "Selecione a conta social pra este arquivo de Seguidores." };
    }
    return uploadFollowers(supabase, clientId, selectedAccountId, buffer);
  }

  if (kind === "audience") {
    if (!selectedAccountId) {
      return { error: "Selecione a conta social pra este arquivo de Público." };
    }
    return uploadAudience(supabase, clientId, selectedAccountId, buffer);
  }

  if (kind === "unknown") {
    return { error: "Não foi possível identificar o tipo deste arquivo." };
  }

  return uploadPosts(supabase, clientId, selectedAccountId, file, buffer, formData);
}

async function uploadFollowers(
  supabase: SupabaseServerClient,
  clientId: string,
  accountId: string,
  buffer: Buffer
): Promise<ActionResult> {
  const points = parseFollowersExport(decodeUtf16File(buffer));
  if (points.length === 0) {
    return { error: "Nenhum dado de seguidores encontrado no arquivo." };
  }

  const { error } = await supabase.from("follower_snapshots").upsert(
    points.map((point) => ({
      social_account_id: accountId,
      snapshot_date: point.date,
      followers: point.followers,
    })),
    { onConflict: "social_account_id,snapshot_date" }
  );

  if (error) {
    return { error: "Não foi possível salvar os dados de seguidores." };
  }

  revalidatePath(`/clients/${clientId}/accounts/${accountId}`);
  return { error: null };
}

async function uploadAudience(
  supabase: SupabaseServerClient,
  clientId: string,
  accountId: string,
  buffer: Buffer
): Promise<ActionResult> {
  const audience = parseAudienceExport(decodeUtf16File(buffer));

  const { error } = await supabase.from("audience_snapshots").insert({
    social_account_id: accountId,
    age_gender: audience.ageGender,
    top_cities: audience.topCities,
    top_countries: audience.topCountries,
  });

  if (error) {
    return { error: "Não foi possível salvar os dados de público." };
  }

  revalidatePath(`/clients/${clientId}/accounts/${accountId}`);
  return { error: null };
}

async function uploadPosts(
  supabase: SupabaseServerClient,
  clientId: string,
  selectedAccountId: string | null,
  file: File,
  buffer: Buffer,
  formData: FormData
): Promise<ActionResult> {
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let accountId = selectedAccountId;

  if (!accountId) {
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
    accountId = account.id;
  }

  const { data: upload, error: uploadError } = await supabase
    .from("report_uploads")
    .insert({
      social_account_id: accountId,
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
    social_account_id: accountId,
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
  redirect(`/clients/${clientId}/accounts/${accountId}`);
}
