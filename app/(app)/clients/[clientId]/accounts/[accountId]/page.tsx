import { redirect } from "next/navigation";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ clientId: string; accountId: string }>;
}) {
  const { clientId, accountId } = await params;
  redirect(`/clients/${clientId}/accounts/${accountId}/visao-geral`);
}
