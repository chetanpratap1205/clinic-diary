import { redirect } from "next/navigation";

export default async function PartnerLeadDetailRedirect(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  redirect(`/field-portal/leads/${id}`);
}
