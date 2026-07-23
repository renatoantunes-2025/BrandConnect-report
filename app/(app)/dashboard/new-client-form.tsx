"use client";

import { useActionState, useRef } from "react";
import { createClientRecord } from "./actions";

const initialState = { error: null as string | null };

export function NewClientForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    const result = await createClientRecord(formData);
    if (!result.error) formRef.current?.reset();
    return result;
  }, initialState);

  return (
    <form ref={formRef} action={formAction} className="flex items-start gap-2">
      <div className="flex flex-col gap-1">
        <input
          name="name"
          placeholder="Nome do cliente (ex: Piello)"
          required
          className="w-64 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
        />
        {state.error ? (
          <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {pending ? "Criando…" : "+ Novo cliente"}
      </button>
    </form>
  );
}
