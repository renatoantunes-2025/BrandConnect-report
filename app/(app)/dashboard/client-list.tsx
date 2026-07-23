"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Client } from "@/lib/types";
import { foldAccents } from "@/lib/slug";

export function ClientList({ clients }: { clients: Client[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = foldAccents(search.trim());
    if (!term) return clients;
    return clients.filter((client) => foldAccents(client.name).includes(term));
  }, [clients, search]);

  if (clients.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Nenhum cliente cadastrado ainda.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar cliente…"
        className="w-full max-w-xs rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
      />

      {filtered.length > 0 ? (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((client) => (
            <li key={client.id}>
              <Link
                href={`/clients/${client.id}`}
                className="block rounded-lg border border-black/10 bg-white p-4 shadow-sm transition-colors hover:border-zinc-400 dark:border-white/10 dark:bg-zinc-900"
              >
                <p className="font-medium text-zinc-900 dark:text-zinc-50">
                  {client.name}
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  /{client.slug}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Nenhum cliente encontrado para &quot;{search}&quot;.
        </p>
      )}
    </div>
  );
}
