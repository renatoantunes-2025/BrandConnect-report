import Papa from "papaparse";

export type FollowerPoint = { date: string; followers: number };

/**
 * Export "Seguidores no Instagram" (gráfico individual do Meta Business
 * Suite, UTF-16LE): uma linha "sep=,", um título, um cabeçalho "Data","Primary"
 * e depois as linhas de data/valor.
 */
export function parseFollowersExport(text: string): FollowerPoint[] {
  const result = Papa.parse<string[]>(text, { skipEmptyLines: true });

  const points: FollowerPoint[] = [];
  for (const row of result.data) {
    if (row.length < 2) continue; // linha de título (só 1 coluna)
    const [rawDate, rawValue] = row;
    const first = rawDate.trim();
    if (!first || first.toLowerCase().startsWith("sep=") || first === "Data") {
      continue;
    }
    const date = first.slice(0, 10);
    const followers = Number(rawValue.trim());
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(followers)) continue;
    points.push({ date, followers });
  }
  return points;
}
