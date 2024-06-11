import { Ai, User } from "@prisma/client";
import { unstable_cache } from "next/cache";

import { canUseAi, getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PublicAiData } from "@/lib/types";

async function fetchAiData(
  domain: string,
): Promise<(Ai & { user: User | null }) | null> {
  let where: { subdomain: string } | { ownDomain: string } = {
    ownDomain: domain,
  };

  const subdomain =
    domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) ||
    !domain.includes(".")
      ? domain.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, "")
      : null;

  if (subdomain) {
    where = { subdomain };
  } else if (domain === process.env.NEXT_PUBLIC_ROOT_DOMAIN) {
    where = { subdomain: "default" };
  }

  return await unstable_cache(
    async () => {
      return prisma.ai.findUnique({
        where,
        include: { user: true },
      });
    },
    [`${domain}-metadata`],
    {
      revalidate: 900,
      tags: [`${domain}-metadata`],
    },
  )();
}

export async function getAiData(
  domain: string,
): Promise<(Ai & { user: User | null }) | null> {
  const ai = await fetchAiData(domain);

  if (ai && (await canUseAi(ai, (await getSession())?.user))) {
    return ai;
  }

  return null;
}

export async function getPublicAiData(
  domain: string,
): Promise<PublicAiData | null> {
  const ai = await fetchAiData(domain);

  if (!ai) {
    return null;
  }

  return {
    id: ai.id,
    name: ai.name,
    image: ai.image,
    userId: ai.userId,
    subdomain: ai.subdomain,
    ownDomain: ai.ownDomain,
  };
}
