import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { Ai } from "@prisma/client";
import { type NextAuthOptions, getServerSession } from "next-auth";
import EmailProvider from "next-auth/providers/email";

import { sendVerificationRequest } from "@/lib/authmail";
import prisma from "@/lib/prisma";
import {
  getUserSubscriptionPlan,
  isSubscriptionMode,
} from "@/lib/subscription";
import { type AiMemberRole, Session, isAiMember } from "@/lib/types";

const VERCEL_DEPLOYMENT = !!process.env.VERCEL_URL;

export const authOptions: NextAuthOptions = {
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      sendVerificationRequest,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login", // Error code passed in query string as ?error=
  },
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  cookies: {
    sessionToken: {
      name: `${VERCEL_DEPLOYMENT ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: VERCEL_DEPLOYMENT,
      },
    },
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.user = user;
      }
      return token;
    },
    redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return url;
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    session: async ({ session, token }) => {
      session.user = {
        ...session.user,
        // @ts-expect-error
        id: token.sub,
        // @ts-expect-error
        username: token?.user?.username || token?.user?.email,
      };
      return session;
    },
  },
};

export function getSession() {
  return getServerSession<NextAuthOptions, Session>(authOptions);
}

export function getMemberRole(ai: Pick<Ai, "members">, email: string) {
  if (!ai || !email) {
    return undefined;
  }

  if (Array.isArray(ai.members)) {
    for (const member of ai.members) {
      if (isAiMember(member)) {
        if (member.email === email) {
          return member.role;
        }
      }
    }
  }
}

export async function canUseAi(ai: Ai, user?: { id: string; email: string }) {
  if (ai.access === "public") {
    return true;
  }

  if (user) {
    if (ai.userId === user.id) {
      return true;
    }

    if (ai.access === "members" && getMemberRole(ai, user.email)) {
      if (!isSubscriptionMode()) {
        return true;
      }

      // Check if the PRO subscription is still active for Team AIs
      const subscriptionPlan = ai.userId
        ? await getUserSubscriptionPlan(ai.userId)
        : null;
      if (subscriptionPlan?.isPro) {
        return true;
      }
    }
  }

  return false;
}

export function withAiAuth(action: any, allowMemberRoles: AiMemberRole[] = []) {
  return async (
    formData: FormData | null,
    aiId: string,
    key: string | null,
  ) => {
    const session = await getSession();
    if (!session) {
      return {
        error: "Not authenticated",
      };
    }
    const ai = await prisma.ai.findUnique({
      where: {
        id: aiId,
      },
    });
    const isMemberRoleAllowed = (memberRole?: AiMemberRole) =>
      memberRole && allowMemberRoles.includes(memberRole);
    if (
      !ai ||
      (ai.userId !== session.user.id &&
        !isMemberRoleAllowed(getMemberRole(ai, session.user.email)))
    ) {
      return {
        error: "Not authorized",
      };
    }

    return action(formData, ai, key);
  };
}

export function withKnowledgeAuth(action: any) {
  return async (
    formData: FormData | null,
    knowledgeId: string,
    key: string | null,
  ) => {
    const session = await getSession();
    if (!session?.user.id) {
      return {
        error: "Not authenticated",
      };
    }
    const knowledge = await prisma.knowledge.findUnique({
      where: {
        id: knowledgeId,
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

    return action(formData, knowledge, key);
  };
}
