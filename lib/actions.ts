"use server";

import prisma from "@/lib/prisma";
import { Knowledge, Ai, Access } from "@prisma/client";
import { revalidateTag } from "next/cache";
import { withKnowledgeAuth, withAiAuth } from "./auth";
import { getSession } from "@/lib/auth";
import {
  addDomainToVercel,
  isValidSubdomain,
  getApexDomain,
  removeDomainFromVercelProject,
  removeDomainFromVercelTeam,
  validDomainRegex,
} from "@/lib/domains";
import { put } from "@vercel/blob";
import { customAlphabet } from "nanoid";
import { getBlurDataURL } from "@/lib/utils";
import { getRatelimitResponse } from "./ratelimit";
import { headers } from "next/headers";
import { generateEmbeddings } from "./embeddings";

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  7,
); // 7-character random string

export const createAi = async (formData: FormData) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }
  const name = formData.get("name") as string;
  const instructions = formData.get("instructions") as string;
  const subdomain = formData.get("subdomain") as string;
  const access = formData.get("access") as Access;

  if (!isValidSubdomain(subdomain)) {
    return {
      error: "This subdomain is already taken.",
    };
  }

  try {
    const response = await prisma.ai.create({
      data: {
        name,
        instructions,
        subdomain,
        access,
        user: {
          connect: {
            id: session.user.id,
          },
        },
      },
    });
    revalidateTag(
      `${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
    );
    return response;
  } catch (error: any) {
    if (error.code === "P2002") {
      return {
        error: "This subdomain is already taken.",
      };
    } else {
      return {
        error: error.message,
      };
    }
  }
};

export const updateAi = withAiAuth(
  async (formData: FormData, ai: Ai, key: string) => {
    const value = formData.get(key) as string;

    try {
      let response;

      if (key === "ownDomain") {
        if (value.includes("ownai.com")) {
          return {
            error: "Cannot use ownai.com subdomain as your own domain",
          };
        }

        // if the domain is valid, we need to add it to Vercel
        if (validDomainRegex.test(value)) {
          response = await prisma.ai.update({
            where: {
              id: ai.id,
            },
            data: {
              ownDomain: value,
            },
          });
          await Promise.all([
            addDomainToVercel(value),
            // add www subdomain as well and redirect to apex domain
            addDomainToVercel(`www.${value}`),
          ]);

          // empty value means the user wants to remove the domain
        } else if (value === "") {
          response = await prisma.ai.update({
            where: {
              id: ai.id,
            },
            data: {
              ownDomain: null,
            },
          });
        }

        // if the AI had a different ownDomain before, we need to remove it from Vercel
        if (ai.ownDomain && ai.ownDomain !== value) {
          // first, we need to check if the apex domain is being used by other AIs
          const apexDomain = getApexDomain(`https://${ai.ownDomain}`);
          const domainCount = await prisma.ai.count({
            where: {
              OR: [
                {
                  ownDomain: apexDomain,
                },
                {
                  ownDomain: {
                    endsWith: `.${apexDomain}`,
                  },
                },
              ],
            },
          });

          // if the apex domain is being used by other AIs
          // we should only remove it from our Vercel project
          if (domainCount >= 1) {
            await removeDomainFromVercelProject(ai.ownDomain);
          } else {
            // this is the only AI using this apex domain
            // so we can remove it entirely from our Vercel team
            await removeDomainFromVercelTeam(ai.ownDomain);
          }
        }
      } else if (key === "subdomain") {
        if (!isValidSubdomain(value)) {
          return {
            error: "This subdomain is already taken.",
          };
        }
        response = await prisma.ai.update({
          where: {
            id: ai.id,
          },
          data: {
            subdomain: value,
          },
        });
      } else if (key === "image") {
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
          return {
            error: "Missing BLOB_READ_WRITE_TOKEN token.",
          };
        }

        const file = formData.get(key) as File;
        const filename = `${nanoid()}.${file.type.split("/")[1]}`;

        const { url } = await put(filename, file, {
          access: "public",
        });

        const blurhash = key === "image" ? await getBlurDataURL(url) : null;

        response = await prisma.ai.update({
          where: {
            id: ai.id,
          },
          data: {
            [key]: url,
            ...(blurhash && { imageBlurhash: blurhash }),
          },
        });
      } else {
        response = await prisma.ai.update({
          where: {
            id: ai.id,
          },
          data: {
            [key]: key === "starters" ? JSON.parse(value) : value,
          },
        });
      }
      revalidateTag(
        `${ai.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
      );
      ai.ownDomain && revalidateTag(`${ai.ownDomain}-metadata`);

      return response;
    } catch (error: any) {
      if (error.code === "P2002") {
        return {
          error: "This domain is already in use by another AI.",
        };
      } else {
        return {
          error: error.message,
        };
      }
    }
  },
);

export const deleteAi = withAiAuth(async (_: FormData, ai: Ai) => {
  try {
    const response = await prisma.ai.delete({
      where: {
        id: ai.id,
      },
    });
    revalidateTag(
      `${ai.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
    );
    response.ownDomain && revalidateTag(`${ai.ownDomain}-metadata`);
    return response;
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
});

export const getAiFromKnowledgeId = async (knowledgeId: string) => {
  const knowledge = await prisma.knowledge.findUnique({
    where: {
      id: knowledgeId,
    },
    select: {
      aiId: true,
    },
  });
  return knowledge?.aiId;
};

export const createKnowledge = withAiAuth(async (_: FormData, ai: Ai) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }
  const response = await prisma.knowledge.create({
    data: {
      aiId: ai.id,
      userId: session.user.id,
    },
  });

  revalidateTag(
    `${ai.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-knowledges`,
  );
  ai.ownDomain && revalidateTag(`${ai.ownDomain}-knowledges`);

  return response;
});

export const updateKnowledge = async (data: Knowledge) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }

  const knowledge = await prisma.knowledge.findUnique({
    where: {
      id: data.id,
    },
    include: {
      ai: true,
    },
  });
  if (!knowledge || knowledge.userId !== session.user.id) {
    return {
      error: "Knowledge not found",
    };
  }

  let embeddings: number[] | null = null;
  if (data.learned) {
    // Needs an embeddings update to learn the new content
    const ratelimitResponse = await getRatelimitResponse(
      headers().get("x-forwarded-for")!,
    );
    if (ratelimitResponse) {
      return {
        error: "You've reached your rate limit for embedding updates.",
      };
    }

    const document = [data.title, data.description, data.content]
      .filter((s) => !!s)
      .join("\n");
    embeddings = document ? await generateEmbeddings(document) : null;
  }

  try {
    const response = await prisma.knowledge.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        learned: data.learned,
      },
    });

    if (embeddings) {
      await prisma.$executeRaw`
        UPDATE "Knowledge"
        SET vector = ${embeddings}::vector
        WHERE id = ${data.id}
      `;
    }

    revalidateTag(
      `${knowledge.ai?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-knowledges`,
    );
    revalidateTag(
      `${knowledge.ai?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-${knowledge.slug}`,
    );

    // if the AI has an own domain, we need to revalidate those tags too
    knowledge.ai?.ownDomain &&
      (revalidateTag(`${knowledge.ai?.ownDomain}-knowledges`),
      revalidateTag(`${knowledge.ai?.ownDomain}-${knowledge.slug}`));

    return response;
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
};

export const deleteKnowledge = withKnowledgeAuth(
  async (_: FormData, knowledge: Knowledge) => {
    try {
      const response = await prisma.knowledge.delete({
        where: {
          id: knowledge.id,
        },
        select: {
          aiId: true,
        },
      });
      return response;
    } catch (error: any) {
      return {
        error: error.message,
      };
    }
  },
);

export const editUser = async (
  formData: FormData,
  _id: unknown,
  key: string,
) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }
  const value = formData.get(key) as string;

  try {
    const response = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        [key]: value,
      },
    });
    return response;
  } catch (error: any) {
    if (error.code === "P2002") {
      return {
        error: `This ${key} is already in use`,
      };
    } else {
      return {
        error: error.message,
      };
    }
  }
};
