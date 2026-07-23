import Papa from "papaparse";

export type AgeGenderRow = { range: string; women: number; men: number };
export type NamedPct = { name: string; pct: number };

export type AudienceExport = {
  ageGender: AgeGenderRow[];
  topCities: NamedPct[];
  topCountries: NamedPct[];
};

function toNumber(value: string): number {
  const n = Number(value.trim());
  return Number.isNaN(n) ? 0 : n;
}

/**
 * Export "Público" (gráfico individual do Meta Business Suite, UTF-16LE):
 * três blocos — faixa etária/gênero (tabela) e principais cidades/países
 * (nomes numa linha, valores na linha seguinte).
 */
export function parseAudienceExport(text: string): AudienceExport {
  const { data: rows } = Papa.parse<string[]>(text, { skipEmptyLines: true });

  const ageGender: AgeGenderRow[] = [];
  const topCities: NamedPct[] = [];
  const topCountries: NamedPct[] = [];

  let i = 0;
  while (i < rows.length) {
    const row = rows[i];
    const first = (row[0] ?? "").trim();

    if (first.toLowerCase().startsWith("sep=")) {
      i++;
      continue;
    }

    if (row.length === 1 && first === "Faixa etária e gênero") {
      i += 2; // pula título + cabeçalho ("", "Mulheres", "Homens")
      while (i < rows.length && rows[i].length >= 3 && (rows[i][0] ?? "").trim() !== "") {
        const [range, women, men] = rows[i];
        ageGender.push({
          range: range.trim(),
          women: toNumber(women),
          men: toNumber(men),
        });
        i++;
      }
      continue;
    }

    if (row.length === 1 && (first === "Principais cidades" || first === "Principais países")) {
      const target = first === "Principais cidades" ? topCities : topCountries;
      const names = rows[i + 1] ?? [];
      const values = rows[i + 2] ?? [];
      names.forEach((name, index) => {
        target.push({ name: name.trim(), pct: toNumber(values[index] ?? "0") });
      });
      i += 3;
      continue;
    }

    i++;
  }

  return { ageGender, topCities, topCountries };
}
