import { createClient } from "@/lib/supabase/server";
import type { Client } from "@/lib/types";
import { NewClientForm } from "./new-client-form";
import { ClientList } from "./client-list";

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

      <ClientList clients={clients ?? []} />
    </div>
  );
}
