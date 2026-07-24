export type StatTileInput = {
  label: string;
  value: number;
  previousValue: number | null;
  kind: "count" | "percent";
  trend?: number[];
};

function formatCompact(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function Delta({ current, previousValue, kind }: Pick<StatTileInput, "previousValue" | "kind"> & { current: number }) {
  if (previousValue === null) return null;

  const delta = kind === "percent" ? current - previousValue : previousValue !== 0 ? ((current - previousValue) / previousValue) * 100 : null;

  if (delta === null) return null;

  const suffix = kind === "percent" ? " p.p." : "%";
  if (Math.abs(delta) < 0.05) {
    return <span className="text-zinc-400 dark:text-zinc-500">±0{suffix} vs mês anterior</span>;
  }

  const isUp = delta > 0;
  const colorClass = isUp
    ? "text-[#006300] dark:text-[#0ca30c]"
    : "text-[#d03b3b] dark:text-[#e66767]";

  return (
    <span className={colorClass}>
      {isUp ? "+" : ""}
      {delta.toFixed(1)}
      {suffix} vs mês anterior
    </span>
  );
}

function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null;

  const width = 84;
  const height = 24;
  const pad = 2;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const stepX = (width - pad * 2) / (points.length - 1);

  const coords = points
    .map((point, index) => {
      const x = pad + index * stepX;
      const y = pad + (1 - (point - min) / range) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const lastPoint = coords.split(" ").at(-1);
  const [lastX, lastY] = (lastPoint ?? "0,0").split(",").map(Number);

  return (
    <svg width={width} height={height} className="mt-2 overflow-visible">
      <polyline
        points={coords}
        fill="none"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        className="stroke-[#2a78d6] dark:stroke-[#3987e5]"
      />
      <circle
        cx={lastX}
        cy={lastY}
        r={3}
        strokeWidth={2}
        className="fill-[#2a78d6] stroke-white dark:fill-[#3987e5] dark:stroke-zinc-900"
      />
    </svg>
  );
}

export function OverviewStats({ tiles }: { tiles: StatTileInput[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="rounded-xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900"
        >
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{tile.label}</p>
          <p className="mt-1.5 text-[27px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {tile.kind === "percent" ? `${tile.value.toFixed(1)}%` : formatCompact(tile.value)}
          </p>
          <p className="mt-1 text-xs">
            <Delta current={tile.value} previousValue={tile.previousValue} kind={tile.kind} />
          </p>
          {tile.trend ? <Sparkline points={tile.trend} /> : null}
        </div>
      ))}
    </div>
  );
}
