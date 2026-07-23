import Papa from "papaparse";

export type ParsedPost = {
  externalPostId: string;
  description: string;
  postType: string;
  durationSeconds: number;
  permalink: string;
  publishedAt: string | null; // ISO 8601
  views: number;
  reach: number;
  likes: number;
  shares: number;
  follows: number;
  comments: number;
  saves: number;
};

export type ParsedAccountInfo = {
  externalAccountId: string;
  username: string;
  displayName: string;
};

export type ParsedInstagramExport = {
  account: ParsedAccountInfo;
  posts: ParsedPost[];
};

// Cabeçalhos como aparecem no export do Meta Business Suite (Instagram).
const HEADER = {
  postId: "Identificação do post",
  accountId: "Identificação da conta",
  username: "Nome de usuário da conta",
  accountName: "Nome da conta",
  description: "Descrição",
  duration: "Duração (s)",
  publishedAt: "Horário de publicação",
  permalink: "Link permanente",
  postType: "Tipo de post",
  views: "Visualizações",
  reach: "Alcance",
  likes: "Curtidas",
  shares: "Compartilhamentos",
  follows: "Seguimentos",
  comments: "Comentários",
  saves: "Salvamentos",
} as const;

function stripBom(text: string): string {
  if (text.charCodeAt(0) === 0xfeff) return text.slice(1);
  // BOM (EF BB BF) relido como latin1 vira os 3 caracteres "ï»¿" — acontece
  // mesmo quando o resto do arquivo ainda não deu sinais de mojibake.
  if (text.startsWith("ï»¿")) return text.slice(3);
  return text;
}

/**
 * Alguns exports chegam com acentos corrompidos (bytes UTF-8 relidos como
 * latin1, ex: "Descrição" -> "DescriÃ§Ã£o"). Detecta o padrão e reverte.
 */
function fixMojibake(text: string): string {
  const suspicious = text.match(/Ã[\x80-\xBF]/g);
  if (!suspicious || suspicious.length < 3) return text;

  try {
    const repaired = Buffer.from(text, "latin1").toString("utf8");
    const stillSuspicious = repaired.match(/Ã[\x80-\xBF]|�/g);
    if (!stillSuspicious || stillSuspicious.length < suspicious.length) {
      return repaired;
    }
  } catch {
    // mantém o texto original se a reinterpretação falhar
  }
  return text;
}

function parseBrDateTime(value: string | undefined): string | null {
  if (!value) return null;
  const match = value
    .trim()
    .match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, day, month, year, hour, minute] = match;
  const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function toInt(value: string | undefined): number {
  const n = parseInt((value ?? "").trim(), 10);
  return Number.isFinite(n) ? n : 0;
}

export function parseInstagramExport(
  fileBuffer: Buffer
): ParsedInstagramExport {
  const decoded = fixMojibake(stripBom(fileBuffer.toString("utf8")));

  const result = Papa.parse<Record<string, string>>(decoded, {
    header: true,
    skipEmptyLines: true,
  });

  const fatalErrors = result.errors.filter((e) => e.type !== "FieldMismatch");
  if (fatalErrors.length > 0) {
    throw new Error(`Falha ao ler o CSV: ${fatalErrors[0].message}`);
  }

  const rows = result.data;
  if (rows.length === 0) {
    throw new Error("O arquivo não contém nenhuma linha de dados.");
  }

  const posts: ParsedPost[] = rows
    .map((row) => ({
      externalPostId: row[HEADER.postId]?.trim() ?? "",
      description: row[HEADER.description]?.trim() ?? "",
      postType: row[HEADER.postType]?.trim() ?? "",
      durationSeconds: toInt(row[HEADER.duration]),
      permalink: row[HEADER.permalink]?.trim() ?? "",
      publishedAt: parseBrDateTime(row[HEADER.publishedAt]),
      views: toInt(row[HEADER.views]),
      reach: toInt(row[HEADER.reach]),
      likes: toInt(row[HEADER.likes]),
      shares: toInt(row[HEADER.shares]),
      follows: toInt(row[HEADER.follows]),
      comments: toInt(row[HEADER.comments]),
      saves: toInt(row[HEADER.saves]),
    }))
    .filter((post) => post.externalPostId.length > 0);

  if (posts.length === 0) {
    throw new Error("Nenhum post válido encontrado no arquivo.");
  }

  const firstRow = rows[0];
  const account: ParsedAccountInfo = {
    externalAccountId: firstRow[HEADER.accountId]?.trim() ?? "",
    username: firstRow[HEADER.username]?.trim() ?? "",
    displayName: firstRow[HEADER.accountName]?.trim() ?? "",
  };

  if (!account.externalAccountId) {
    throw new Error(
      "Não foi possível identificar a conta no arquivo (coluna 'Identificação da conta' vazia)."
    );
  }

  return { account, posts };
}

/**
 * Tenta extrair o período coberto pelo relatório a partir do nome do
 * arquivo, ex: "Jul-01-2026_Jul-22-2026_889284557099775 (3).csv".
 * Usado apenas para pré-preencher o formulário de upload.
 */
export function parsePeriodFromFileName(
  fileName: string
): { start: string; end: string } | null {
  const match = fileName.match(
    /([A-Za-z]{3})-(\d{2})-(\d{4})_([A-Za-z]{3})-(\d{2})-(\d{4})/
  );
  if (!match) return null;

  const months: Record<string, string> = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };

  const [, m1, d1, y1, m2, d2, y2] = match;
  const mo1 = months[m1];
  const mo2 = months[m2];
  if (!mo1 || !mo2) return null;

  return { start: `${y1}-${mo1}-${d1}`, end: `${y2}-${mo2}-${d2}` };
}
