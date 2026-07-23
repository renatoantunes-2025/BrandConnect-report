"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { SocialAccount } from "@/lib/types";
import { foldAccents } from "@/lib/slug";

export function AccountList({
  accounts,
  clientId,
}: {
  accounts: SocialAccount[];
  clientId: string;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = foldAccents(search.trim());
    if (!term) return accounts;
    return accounts.filter((account) =>
      foldAccents(
        `${account.username ?? ""} ${account.display_name ?? ""} ${account.platform}`
      ).includes(term)
    );
  }, [accounts, search]);

  if (accounts.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Nenhuma conta ainda — faça o primeiro upload ao lado.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {accounts.length > 3 ? (
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar conta…"
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      ) : null}

      {filtered.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {filtered.map((account) => (
            <li key={account.id}>
              <Link
                href={`/clients/${clientId}/accounts/${account.id}`}
                className="flex items-center justify-between rounded-lg border border-black/10 bg-white p-4 shadow-sm transition-colors hover:border-zinc-400 dark:border-white/10 dark:bg-zinc-900"
              >
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    @{account.username ?? account.external_account_id}
                  </p>
                  <p className="text-xs capitalize text-zinc-500 dark:text-zinc-400">
                    {account.platform}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Nenhuma conta encontrada para &quot;{search}&quot;.
        </p>
      )}
    </div>
  );
}
