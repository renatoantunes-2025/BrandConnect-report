import type { Post } from "@/lib/types";

export const FORMAT_OPTIONS = [
  "Reel",
  "Imagem",
  "Carrossel",
  "Story",
  "Vídeo",
  "Live",
  "Outro",
] as const;

/** Mesma regra usada no backfill da migration — normaliza o "Tipo de post" bruto do CSV. */
export function deriveFormat(postType: string | null): string {
  if (!postType) return "";
  return postType.replace(/ do (Instagram|Facebook)$/i, "").trim();
}

export function computeInteractions(
  post: Pick<Post, "likes" | "comments" | "shares" | "saves">
): number {
  return post.likes + post.comments + post.shares + post.saves;
}

/** Retorna a taxa de engajamento em pontos percentuais (ex: 6.5 para 6.5%). */
export function computeEngagementRate(
  post: Pick<Post, "likes" | "comments" | "shares" | "saves" | "reach">
): number {
  if (post.reach === 0) return 0;
  return (computeInteractions(post) / post.reach) * 100;
}

export function formatMonthLabel(iso: string | null): string {
  if (!iso) return "-";
  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
  const [month, , year] = label.split(" ");
  return `${month.charAt(0).toUpperCase()}${month.slice(1)}/${year}`;
}
