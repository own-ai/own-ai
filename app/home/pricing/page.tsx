import Link from "next/link";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "Pricing | ownAI",
};

export default function PricingPage() {
  return (
    <section className="container flex flex-col gap-6 py-8 md:max-w-[64rem] md:py-12 lg:py-24">
      <div className="mx-auto flex w-full flex-col gap-4 md:max-w-[58rem]">
        <h2 className="font-cal text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
          AI for everyone
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Our goal is to make AI accessible to everyone. That&apos;s why we
          offer you up to 3 own AIs for free.
        </p>
      </div>
      <div className="grid w-full items-start gap-10 rounded-lg border p-10 md:grid-cols-[1fr_200px]">
        <div className="grid gap-6">
          <h3 className="text-xl font-bold sm:text-2xl">
            Included in the free plan
          </h3>
          <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4" /> 3 custom AIs (private or
              public)
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4" /> Unlimited Knowledge per AI
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4" /> ownAI Subdomains
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-4 text-center">
          <div>
            <h4 className="text-7xl font-bold">free</h4>
          </div>
          <Link
            href={
              process.env.NEXT_PUBLIC_VERCEL_ENV
                ? `https://app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
                : `http://app.localhost:3000`
            }
            className={cn(buttonVariants({ size: "lg" }))}
          >
            Get Started
          </Link>
        </div>
      </div>
      <div className="grid w-full items-start gap-10 rounded-lg border p-10 md:grid-cols-[1fr_200px]">
        <div className="grid gap-6">
          <h3 className="text-xl font-bold sm:text-2xl">
            Included in the{" "}
            <span className="inline-block bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
              PRO
            </span>{" "}
            plan
          </h3>
          <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4" /> Unlimited custom AIs (private
              or public)
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4" /> Unlimited Knowledge per AI
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4" /> Subdomains and Custom Domains
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4" /> Team AIs (coming soon)
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-4 text-center">
          <div>
            <h4 className="text-7xl font-bold">$19</h4>
            <p className="text-sm font-medium text-muted-foreground">
              Billed Monthly
            </p>
          </div>
          <Link
            href={
              process.env.NEXT_PUBLIC_VERCEL_ENV
                ? `https://app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
                : `http://app.localhost:3000`
            }
            className={cn(buttonVariants({ size: "lg" }))}
          >
            Get Started
          </Link>
        </div>
      </div>
    </section>
  );
}
