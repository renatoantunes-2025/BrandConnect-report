"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ClientTabs({ clientId }: { clientId: string }) {
  const pathname = usePathname();

  const tabs = [
    { href: `/clients/${clientId}/dados`, label: "Dados importados" },
    { href: `/clients/${clientId}/planilha`, label: "Planilha editorial" },
    { href: `/clients/${clientId}/contas`, label: "Contas & Upload" },
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
