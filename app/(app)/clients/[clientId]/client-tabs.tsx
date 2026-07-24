"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function ClientTabs({ clientId }: { clientId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const accountParam = searchParams.get("account");
  const accountSuffix = accountParam ? `?account=${accountParam}` : "";

  const tabs = [
    {
      href: `/clients/${clientId}/visao-geral`,
      label: "Visão Geral",
      keepAccount: true,
    },
    { href: `/clients/${clientId}/posts`, label: "Posts", keepAccount: true },
    {
      href: `/clients/${clientId}/planilha`,
      label: "Planilha editorial",
      keepAccount: false,
    },
    {
      href: `/clients/${clientId}/contas`,
      label: "Contas & Upload",
      keepAccount: false,
    },
  ];

  return (
    <nav className="flex gap-1 border-b border-black/10 dark:border-white/10">
      {tabs.map((tab) => {
        const active = pathname?.startsWith(tab.href);
        const href = tab.keepAccount ? `${tab.href}${accountSuffix}` : tab.href;
        return (
          <Link
            key={tab.href}
            href={href}
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
