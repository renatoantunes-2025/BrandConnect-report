import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Client } from "@/lib/types";
import { NewClientForm } from "./new-client-form";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("name")
    .returns<Client[]>();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Clientes
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Selecione um cliente para ver as contas sociais e os relatórios.
          </p>
        </div>
        <NewClientForm />
      </div>

      {clients && clients.length > 0 ? (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <li key={client.id}>
              <Link
                href={`/clients/${client.id}`}
                className="block rounded-lg border border-black/10 bg-white p-4 shadow-sm transition-colors hover:border-zinc-400 dark:border-white/10 dark:bg-zinc-900"
              >
                <p className="font-medium text-zinc-900 dark:text-zinc-50">{client.name}</p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">/{client.slug}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Nenhum cliente cadastrado ainda.
        </p>
      )}
    </div>
  );
}
