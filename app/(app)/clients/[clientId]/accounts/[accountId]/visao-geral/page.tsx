import { createClient } from "@/lib/supabase/server";
import { computeInteractions, formatMonthLabel } from "@/lib/editorial";
import { currentMonth, isValidMonth, monthBounds, shiftMonth } from "@/lib/months";
import { MonthPicker } from "./month-picker";
import { OverviewStats, type StatTileInput } from "./overview-stats";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function fetchMonthTotals(
  supabase: SupabaseServerClient,
  accountId: string,
  month: string
) {
  const { start, nextStart } = monthBounds(month);
  const { data } = await supabase
    .from("posts")
    .select("reach, views, likes, comments, shares, saves")
    .eq("social_account_id", accountId)
    .gte("published_at", start)
    .lt("published_at", nextStart);

  const posts = data ?? [];
  const totals = posts.reduce(
    (acc, post) => ({
      reach: acc.reach + post.reach,
      views: acc.views + post.views,
      interactions: acc.interactions + computeInteractions(post),
    }),
    { reach: 0, views: 0, interactions: 0 }
  );

  return {
    postsCount: posts.length,
    reach: totals.reach,
    views: totals.views,
    interactions: totals.interactions,
    engagementRate: totals.reach > 0 ? (totals.interactions / totals.reach) * 100 : 0,
  };
}

async function fetchFollowersBefore(
  supabase: SupabaseServerClient,
  accountId: string,
  exclusiveEnd: string
) {
  const { data } = await supabase
    .from("follower_snapshots")
    .select("followers")
    .eq("social_account_id", accountId)
    .lt("snapshot_date", exclusiveEnd)
    .order("snapshot_date", { ascending: false })
    .limit(1);
  return data?.[0]?.followers ?? null;
}

async function resolveMonth(
  supabase: SupabaseServerClient,
  accountId: string,
  requested: string | undefined
): Promise<string> {
  if (isValidMonth(requested)) return requested;

  const { data: latestPost } = await supabase
    .from("posts")
    .select("published_at")
    .eq("social_account_id", accountId)
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return latestPost?.published_at ? latestPost.published_at.slice(0, 7) : currentMonth();
}

export default async function VisaoGeralPage({
  params,
  searchParams,
}: {
  params: Promise<{ accountId: string }>;
  searchParams: Promise<{ month?: string }>;
}) {
  const { accountId } = await params;
  const { month: monthParam } = await searchParams;
  const supabase = await createClient();

  const month = await resolveMonth(supabase, accountId, monthParam);

  const previousMonth = shiftMonth(month, -1);
  const { start: monthStart, nextStart: monthNextStart } = monthBounds(month);

  const [current, previous, followersNow, followersPrev, historyRows] = await Promise.all([
    fetchMonthTotals(supabase, accountId, month),
    fetchMonthTotals(supabase, accountId, previousMonth),
    fetchFollowersBefore(supabase, accountId, monthNextStart),
    fetchFollowersBefore(supabase, accountId, monthStart),
    supabase
      .from("follower_snapshots")
      .select("followers")
      .eq("social_account_id", accountId)
      .lt("snapshot_date", monthNextStart)
      .order("snapshot_date", { ascending: true }),
  ]);

  const trend = (historyRows.data ?? []).slice(-12).map((row) => row.followers);
  const hadPreviousData = previous.postsCount > 0;

  const tiles: StatTileInput[] = [
    {
      label: "Seguidores",
      value: followersNow ?? 0,
      previousValue: followersNow !== null ? followersPrev : null,
      kind: "count",
      trend: trend.length >= 2 ? trend : undefined,
    },
    {
      label: "Alcance orgânico",
      value: current.reach,
      previousValue: hadPreviousData ? previous.reach : null,
      kind: "count",
    },
    {
      label: "Impressões orgânicas",
      value: current.views,
      previousValue: hadPreviousData ? previous.views : null,
      kind: "count",
    },
    {
      label: "Interações",
      value: current.interactions,
      previousValue: hadPreviousData ? previous.interactions : null,
      kind: "count",
    },
    {
      label: "Taxa de engajamento",
      value: current.engagementRate,
      previousValue: hadPreviousData ? previous.engagementRate : null,
      kind: "percent",
    },
    {
      label: "Posts",
      value: current.postsCount,
      previousValue: hadPreviousData ? previous.postsCount : null,
      kind: "count",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {formatMonthLabel(`${month}-01`)}
        </p>
        <MonthPicker month={month} />
      </div>

      <OverviewStats tiles={tiles} />
    </div>
  );
}
