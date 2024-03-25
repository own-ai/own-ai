import { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
      ? `https://app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
      : "http://app.localhost:3000",
  ),
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      {children}
      <Analytics />
      <SpeedInsights />
    </Providers>
  );
}
