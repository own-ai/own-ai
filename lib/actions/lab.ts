"use server";

import { Access, Ai, Knowledge } from "@prisma/client";
import { put } from "@vercel/blob";
import { customAlphabet } from "nanoid";
import { revalidateTag } from "next/cache";

import { getMemberRole, withAiAuth, withKnowledgeAuth } from "@/lib/auth";
import { getSession } from "@/lib/auth";
import {
  addDomainToVercel,
  getApexDomain,
  isValidSubdomain,
  removeDomainFromVercelProject,
  removeDomainFromVercelTeam,
  validDomainRegex,
} from "@/lib/domains";
import { generateEmbedding } from "@/lib/embeddings";
import { isImageUploadEnabled } from "@/lib/environment";
import prisma from "@/lib/prisma";
import { ratelimit } from "@/lib/ratelimit";
import {
  getUserSubscriptionPlan,
  isSubscriptionMode,
} from "@/lib/subscription";
import { getBlurDataURL } from "@/lib/utils";

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

  if (isSubscriptionMode()) {
    const subscriptionPlan = await getUserSubscriptionPlan(session.user.id);
    const aiCount = await prisma.ai.count({
      where: {
        userId: session.user.id,
      },
    });
    if (!subscriptionPlan.isPro && aiCount >= 3) {
      return {
        error: "Please upgrade to PRO to have more than 3 AIs.",
      };
    }
  }

  const name = formData.get("name") as string;
  const instructions = formData.get("instructions") as string;
  const subdomain = formData.get("subdomain") as string;
  const access = formData.get("access") as Access;

  // Use the first model as default
  const model = JSON.parse(process.env.AI_MODELS || "null")?.[0]?.key as string;

  if (!model) {
    return {
      error:
        "No AI models have been defined for this ownAI installation. Please ask your ownAI admin to set the environment variable AI_MODELS.",
    };
  }

  if (!isValidSubdomain(subdomain)) {
    return {
      error:
        "Invalid domain: Only lowercase letters, numbers and the hyphen are allowed.",
    };
  }

  try {
    const response = await prisma.ai.create({
      data: {
        name,
        instructions,
        subdomain,
        access,
        model,
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
        if (
          process.env.NEXT_PUBLIC_ROOT_DOMAIN &&
          value.includes(process.env.NEXT_PUBLIC_ROOT_DOMAIN)
        ) {
          return {
            error: `Cannot use ${process.env.NEXT_PUBLIC_ROOT_DOMAIN} subdomain as your own domain`,
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
            error:
              "Invalid subdomain: Only lowercase letters, numbers and the hyphen are allowed.",
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
        if (!isImageUploadEnabled()) {
          return {
            error: "Sorry, but uploading images is currently disabled.",
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
            [key]: ["members", "starters"].includes(key)
              ? JSON.parse(value)
              : value,
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

export const getAiIdFromKnowledgeId = async (knowledgeId: string) => {
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

export const getIsUserAiOwner = async (aiId: string) => {
  const session = await getSession();
  if (!session) {
    return false;
  }

  const ai = await prisma.ai.findUnique({
    where: {
      id: aiId,
    },
    select: {
      userId: true,
    },
  });
  return ai?.userId === session.user.id;
};

export const createKnowledge = withAiAuth(
  async (_: FormData, ai: Ai) => {
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
  },
  ["teacher"],
);

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
  if (!knowledge || !knowledge.ai) {
    return {
      error: "Knowledge not found",
    };
  }
  if (
    knowledge.ai.userId !== session.user.id &&
    getMemberRole(knowledge.ai, session.user.email) !== "teacher"
  ) {
    return {
      error: "Not authorized",
    };
  }

  let embedding: number[] | null = null;
  if (data.learned) {
    // Needs an embedding update to learn the new content
    const limit = await ratelimit(`embeddings_update_${session.user.id}`);
    if (limit) {
      return {
        error: `You have sent many requests in a short time. Please wait ${limit.toFixed()} seconds or contact us to get a higher limit.`,
      };
    }
    const document = [data.title, data.content].filter((s) => !!s).join("\n");
    embedding = document ? await generateEmbedding(document) : null;
  }

  try {
    const response = await prisma.knowledge.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        content: data.content,
        learned: data.learned,
      },
    });

    if (embedding) {
      const vector = `[${embedding.join(",")}]`;
      await prisma.$executeRaw`
        UPDATE "Knowledge"
        SET vector = ${vector}::vector
        WHERE id = ${data.id}
      `;
    }

    revalidateTag(
      `${knowledge.ai?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-knowledges`,
    );
    revalidateTag(
      `${knowledge.ai?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-${data.id}`,
    );

    // if the AI has an own domain, we need to revalidate those tags too
    knowledge.ai?.ownDomain &&
      (revalidateTag(`${knowledge.ai?.ownDomain}-knowledges`),
      revalidateTag(`${knowledge.ai?.ownDomain}-${data.id}`));

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

  const allowedKeys = ["name"];
  if (!allowedKeys.includes(key)) {
    return {
      error: `Please contact us to change ${key}.`,
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
