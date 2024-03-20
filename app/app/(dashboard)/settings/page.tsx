import { redirect } from "next/navigation";

import Form from "@/components/form";
import BillingForm from "@/components/form/billing-form";
import { editUser } from "@/lib/actions";
import { getSession } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { getUserSubscriptionPlan } from "@/lib/subscription";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const subscriptionPlan = await getUserSubscriptionPlan(session.user.id);

  // If the user has a PRO plan, check cancel status on Stripe.
  let isCanceled = false;
  if (subscriptionPlan.isPro && subscriptionPlan.stripeSubscriptionId) {
    const stripePlan = await stripe.subscriptions.retrieve(
      subscriptionPlan.stripeSubscriptionId,
    );
    isCanceled = stripePlan.cancel_at_period_end;
  }

  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-8">
      <div className="flex flex-col space-y-6">
        <h1 className="font-cal text-3xl font-bold dark:text-white">
          Settings
        </h1>
        <Form
          title="Name"
          description="How should we call you?"
          helpText=""
          inputAttrs={{
            name: "name",
            type: "text",
            defaultValue: session.user.name!,
            maxLength: 100,
          }}
          handleSubmit={editUser}
        />
        <Form
          title="E-mail"
          description="Please contact us if you would like to change your e-mail address."
          helpText=""
          inputAttrs={{
            name: "email",
            type: "email",
            defaultValue: session.user.email!,
            disabled: true,
          }}
          contactUs={true}
          handleSubmit={editUser}
        />
        <BillingForm
          subscriptionPlan={{
            ...subscriptionPlan,
            isCanceled,
          }}
        />
      </div>
    </div>
  );
}
