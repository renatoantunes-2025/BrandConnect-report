"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { SocialAccount } from "@/lib/types";

export function AccountSwitcher({ accounts }: { accounts: SocialAccount[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (accounts.length === 0) return null;

  const current = searchParams.get("account") ?? accounts[0].id;

  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-black/10 bg-zinc-100 p-1 dark:border-white/10 dark:bg-zinc-900">
      {accounts.map((account) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("account", account.id);
        const active = account.id === current;

        return (
          <Link
            key={account.id}
            href={`${pathname}?${params.toString()}`}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                active ? "bg-[#2a78d6] dark:bg-[#3987e5]" : "bg-zinc-400 dark:bg-zinc-600"
              }`}
            />
            @{account.username ?? account.external_account_id}
          </Link>
        );
      })}
    </div>
  );
}
