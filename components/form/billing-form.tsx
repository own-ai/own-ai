"use client";

import * as React from "react";
import { toast } from "sonner";

import LoadingDots from "@/components/icons/loading-dots";
import { reportEvent } from "@/lib/environment";
import { UserSubscriptionPlan } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

interface BillingFormProps extends React.HTMLAttributes<HTMLFormElement> {
  subscriptionPlan: UserSubscriptionPlan & {
    isCanceled: boolean;
  };
}

export default function BillingForm({
  subscriptionPlan,
  className,
  ...props
}: BillingFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    reportEvent(
      subscriptionPlan.isPro ? "Opened Manage Subscription" : "Opened Checkout",
    );

    // Get a Stripe session URL.
    const response = await fetch("/api/subscription");

    if (!response?.ok) {
      toast.error(
        "Something went wrong. Please refresh the page and try again.",
      );
      setIsLoading(false);
      return;
    }

    // Redirect to the Stripe session.
    // This could be a checkout page for the initial upgrade.
    // Or portal to manage the existing subscription.
    const session = await response.json();
    if (session) {
      window.location.href = session.url;
    }
  }

  return (
    <form
      className={cn(
        "rounded-lg border border-stone-200 bg-white dark:border-stone-700 dark:bg-black",
        className,
      )}
      onSubmit={onSubmit}
      {...props}
    >
      <div className="relative flex flex-col space-y-4 p-5 sm:p-10">
        <h2 className="font-cal text-xl dark:text-white">
          Your{" "}
          <span className="inline-block bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
            PRO
          </span>{" "}
          Upgrade
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          You are currently on the{" "}
          <strong
            className={
              subscriptionPlan.isPro
                ? "inline-block bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent"
                : ""
            }
          >
            {subscriptionPlan.name}
          </strong>{" "}
          plan.{" "}
          {subscriptionPlan.isPro ? (
            "Great choice! You can create unlimited AIs, use your own domains and share AIs with your team."
          ) : (
            <>
              Upgrade now to{" "}
              <strong className="inline-block bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                PRO
              </strong>{" "}
              for unlimited AIs, own domains and shared AIs for your team!
            </>
          )}
        </p>
      </div>
      <div className="flex flex-col items-center justify-center space-y-2 rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800 sm:flex-row sm:justify-between sm:space-y-0 sm:px-10">
        {subscriptionPlan.isPro && subscriptionPlan.stripeCurrentPeriodEnd ? (
          <p className="rounded-full text-sm text-xs font-medium text-stone-500 dark:text-stone-400">
            {subscriptionPlan.isCanceled
              ? "Your plan will be canceled on "
              : "Your plan renews on "}
            {formatDate(subscriptionPlan.stripeCurrentPeriodEnd)}.
          </p>
        ) : (
          <p></p>
        )}
        <button
          className={cn(
            "flex h-8 w-32 items-center justify-center space-x-2 rounded-md border text-sm transition-all focus:outline-none sm:h-10",
            isLoading
              ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
              : "border-black bg-black text-white hover:bg-white hover:text-black dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800",
          )}
          disabled={isLoading}
        >
          {isLoading ? (
            <LoadingDots color="#808080" />
          ) : subscriptionPlan.isPro ? (
            "Manage"
          ) : (
            "Upgrade to PRO"
          )}
        </button>
      </div>
    </form>
  );
}
