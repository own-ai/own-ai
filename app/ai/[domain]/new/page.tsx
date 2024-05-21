import { redirect } from "next/navigation";

import { aiPath } from "@/lib/urls";

export default async function NewPage({
  params,
}: {
  params: { domain: string };
}) {
  const domain = decodeURIComponent(params.domain);
  redirect(aiPath(domain, "/"));
}
