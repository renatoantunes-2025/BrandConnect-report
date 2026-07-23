"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";

export async function createClientRecord(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "Informe o nome do cliente." };
  }

  const supabase = await createClient();
  const baseSlug = slugify(name) || "cliente";

  let slug = baseSlug;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { error } = await supabase.from("clients").insert({ name, slug });
    if (!error) {
      revalidatePath("/dashboard");
      return { error: null };
    }
    if (error.code === "23505") {
      slug = `${baseSlug}-${attempt + 2}`;
      continue;
    }
    return { error: "Não foi possível criar o cliente." };
  }

  return { error: "Não foi possível gerar um identificador único para o cliente." };
}
