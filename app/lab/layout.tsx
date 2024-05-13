import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Metadata } from "next";

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
      ? `https://lab.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
      : "http://lab.localhost:3000",
  ),
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <Analytics />
      <SpeedInsights />
    </Providers>
  );
}
