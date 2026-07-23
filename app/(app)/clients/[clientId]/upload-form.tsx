"use client";

import { useActionState } from "react";
import { uploadReport } from "./actions";
import type { SocialAccount } from "@/lib/types";

const initialState = { error: null as string | null };

export function UploadForm({
  clientId,
  accounts,
}: {
  clientId: string;
  accounts: SocialAccount[];
}) {
  const boundAction = uploadReport.bind(null, clientId);
  const [state, formAction, pending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    const result = await boundAction(formData);
    return result ?? initialState;
  }, initialState);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-900"
    >
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
        Novo upload
      </p>

      <div className="flex flex-col gap-1">
        <label htmlFor="file" className="text-xs text-zinc-500 dark:text-zinc-400">
          Arquivo exportado do Meta Business Suite (.csv)
        </label>
        <input
          id="file"
          name="file"
          type="file"
          accept=".csv"
          required
          className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-zinc-900 file:px-3 file:py-1.5 file:text-sm file:text-white dark:file:bg-zinc-50 dark:file:text-zinc-900"
        />
        <p className="text-xs text-zinc-400">
          Aceita relatório de posts, Seguidores ou Público — o tipo é
          detectado automaticamente.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="social_account_id" className="text-xs text-zinc-500 dark:text-zinc-400">
          Conta social
        </label>
        <select
          id="social_account_id"
          name="social_account_id"
          defaultValue=""
          className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="">Detectar automaticamente (só relatório de posts)</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              @{account.username ?? account.external_account_id}
            </option>
          ))}
        </select>
        <p className="text-xs text-zinc-400">
          Obrigatório para arquivos de Seguidores e Público — eles não trazem
          a identificação da conta.
        </p>
      </div>

      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="period_start" className="text-xs text-zinc-500 dark:text-zinc-400">
            Início do período (opcional)
          </label>
          <input
            id="period_start"
            name="period_start"
            type="date"
            className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="period_end" className="text-xs text-zinc-500 dark:text-zinc-400">
            Fim do período (opcional)
          </label>
          <input
            id="period_end"
            name="period_end"
            type="date"
            className="rounded-md border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
      </div>
      <p className="text-xs text-zinc-400">
        Período usado só no relatório de posts — se não preencher, tentamos
        extrair do nome do arquivo.
      </p>

      {state.error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {pending ? "Enviando…" : "Enviar arquivo"}
      </button>
    </form>
  );
}
