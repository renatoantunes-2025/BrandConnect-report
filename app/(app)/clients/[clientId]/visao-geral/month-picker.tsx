"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function MonthPicker({ month }: { month: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <input
      type="month"
      defaultValue={month}
      onChange={(e) => {
        if (!e.target.value) return;
        const params = new URLSearchParams(searchParams.toString());
        params.set("month", e.target.value);
        router.push(`${pathname}?${params.toString()}`);
      }}
      className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
    />
  );
}
