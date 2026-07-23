"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AccountTabs({
  clientId,
  accountId,
}: {
  clientId: string;
  accountId: string;
}) {
  const pathname = usePathname();
  const base = `/clients/${clientId}/accounts/${accountId}`;

  const tabs = [
    { href: `${base}/visao-geral`, label: "Visão Geral" },
    { href: `${base}/posts`, label: "Todos os posts" },
  ];

  return (
    <nav className="flex gap-1 border-b border-black/10 dark:border-white/10">
      {tabs.map((tab) => {
        const active = pathname?.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
