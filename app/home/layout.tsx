import { Metadata } from "next";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { MainNav } from "@/components/home/main-nav";
import { SiteFooter } from "@/components/home/site-footer";
import { Providers } from "@/components/providers";

const title = "ownAI – Have your own AI";
const description = "Have your own AI.";
const image = "/og-image.png";

export const metadata: Metadata = {
  title,
  description,
  icons: ["/favicon.ico"],
  openGraph: {
    title,
    description,
    images: [image],
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_VERCEL_ENV
      ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
      : "http://localhost:3000",
  ),
};

interface HomeLayoutProps {
  children: React.ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps) {
  return (
    <Providers>
      <div className="flex min-h-screen flex-col">
        <header className="container z-40 bg-background">
          <div className="flex h-20 items-center justify-between py-6">
            <MainNav
              items={[
                {
                  title: "Examples",
                  href: "/#examples",
                },
                {
                  title: "Pricing",
                  href: "/pricing",
                },
                {
                  title: "Privacy",
                  href: "/privacy",
                },
              ]}
            />
            <nav>
              <Link
                href={
                  process.env.NEXT_PUBLIC_VERCEL_ENV
                    ? `https://app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
                    : `http://app.localhost:3000`
                }
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "px-4",
                )}
              >
                Login
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
      <Analytics />
      <SpeedInsights />
    </Providers>
  );
}
