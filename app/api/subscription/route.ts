import { getSession } from "@/lib/auth";
import { isDeployed } from "@/lib/environment";
import { stripe } from "@/lib/stripe";
import { getUserSubscriptionPlan, proPlan } from "@/lib/subscription";

const billingUrl = isDeployed()
  ? `https://lab.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/settings`
  : `http://lab.localhost:3000/settings`;

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return new Response(null, { status: 403 });
    }

    const subscriptionPlan = await getUserSubscriptionPlan(session.user.id);

    // The user is on the PRO plan.
    // Create a portal session to manage the subscription.
    if (subscriptionPlan.isPro && subscriptionPlan.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: subscriptionPlan.stripeCustomerId,
        return_url: billingUrl,
      });

      return new Response(JSON.stringify({ url: stripeSession.url }));
    }

    // The user is on the free plan.
    // Create a checkout session to upgrade.
    if (!proPlan.stripePriceId) {
      return new Response("Stripe Price ID is not defined.", { status: 500 });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: billingUrl,
      cancel_url: billingUrl,
      mode: "subscription",
      billing_address_collection: "auto",
      allow_promotion_codes: true,
      customer_email: session.user.email,
      line_items: [
        {
          price: proPlan.stripePriceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
      },
    });

    return new Response(JSON.stringify({ url: stripeSession.url }));
  } catch (error) {
    return new Response(null, { status: 500 });
  }
}
