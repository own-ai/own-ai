import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Ai, User } from "@prisma/client";
import { PublicAiData } from "./types";

async function fetchAiData(
  domain: string,
): Promise<(Ai & { user: User | null }) | null> {
  const subdomain = domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)
    ? domain.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, "")
    : null;

  return await unstable_cache(
    async () => {
      return prisma.ai.findUnique({
        where: subdomain ? { subdomain } : { ownDomain: domain },
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

  if (
    ai?.access === "public" ||
    ai?.user?.id === (await getSession())?.user.id
  ) {
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
