export function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function shiftMonth(month: string, delta: number): string {
  const [year, mon] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, mon - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** `start`: primeiro dia do mês. `nextStart`: primeiro dia do mês seguinte (limite exclusivo). */
export function monthBounds(month: string): { start: string; nextStart: string } {
  return { start: `${month}-01`, nextStart: `${shiftMonth(month, 1)}-01` };
}

export function isValidMonth(value: string | undefined): value is string {
  return !!value && /^\d{4}-\d{2}$/.test(value);
}
