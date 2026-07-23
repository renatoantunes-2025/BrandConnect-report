"use client";

import { usePathname, useRouter } from "next/navigation";

export function MonthPicker({ month }: { month: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <input
      type="month"
      defaultValue={month}
      onChange={(e) => {
        if (!e.target.value) return;
        router.push(`${pathname}?month=${e.target.value}`);
      }}
      className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
    />
  );
}
