import prisma from "@/lib/prisma";
import { SubscriptionPlan, UserSubscriptionPlan } from "@/lib/types";

export const freePlan: SubscriptionPlan = {
  name: "Free",
  stripePriceId: null,
};

export const proPlan: SubscriptionPlan = {
  name: "PRO",
  stripePriceId: process.env.STRIPE_PRO_MONTHLY_PLAN_ID || null,
};

export function isSubscriptionMode() {
  return (
    process.env.NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS === "1" ||
    process.env.NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS === "true"
  );
}

export async function getUserSubscriptionPlan(
  userId: string,
): Promise<UserSubscriptionPlan> {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
    select: {
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      stripeCustomerId: true,
      stripePriceId: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const isPro = !!(
    user.stripePriceId &&
    user.stripeCurrentPeriodEnd &&
    user.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now()
  );

  const plan = isPro ? proPlan : freePlan;

  return {
    ...plan,
    ...user,
    stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd?.getTime() ?? null,
    isPro,
  };
}
