import { decodeUtf16File, isUtf16leBom } from "./fileEncoding";

export type FileKind = "posts" | "followers" | "audience" | "unknown";

/**
 * O export de posts em massa é sempre UTF-8. Os exports de gráfico individual
 * (Seguidores, Público) vêm em UTF-16LE com uma linha "sep=," no topo — por
 * isso a codificação já entrega um sinal forte de qual dos dois é.
 */
export function detectFileKind(buffer: Buffer): FileKind {
  if (!isUtf16leBom(buffer)) {
    return "posts";
  }

  const text = decodeUtf16File(buffer);
  if (text.includes("Seguidores no Instagram")) return "followers";
  if (text.includes("Faixa etária e gênero")) return "audience";
  return "unknown";
}
