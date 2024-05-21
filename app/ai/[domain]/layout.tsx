import { Metadata } from "next";
import { notFound } from "next/navigation";

import { Header } from "@/components/chat/header";
import { Providers } from "@/components/chat/providers";
import { TailwindIndicator } from "@/components/chat/tailwind-indicator";
import { Toaster } from "@/components/ui/sonner";
import { getPublicAiData } from "@/lib/fetchers";

export async function generateMetadata({
  params,
}: {
  params: { domain: string };
}): Promise<Metadata | null> {
  const domain = decodeURIComponent(params.domain);
  const data = await getPublicAiData(domain);
  if (!data) {
    return null;
  }
  const { name: title, image } = data as {
    name: string;
    image: string;
  };

  return {
    title,
    openGraph: {
      title,
      images: [image],
    },
    metadataBase: new URL(`https://${domain}`),
    // Set canonical URL to own domain if it exists
    ...(params.domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) &&
      data.ownDomain && {
        alternates: {
          canonical: `https://${data.ownDomain}`,
        },
      }),
  };
}

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

interface AiLayoutProps {
  params: { domain: string };
  children: React.ReactNode;
}

export default async function AiLayout({ params, children }: AiLayoutProps) {
  const domain = decodeURIComponent(params.domain);
  const ai = await getPublicAiData(domain);

  if (!ai) {
    notFound();
  }

  return (
    <>
      <Toaster position="top-center" />
      <Providers
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <div className="flex min-h-screen flex-col">
          <Header domain={domain} ai={ai} />
          <main className="flex flex-1 flex-col bg-muted/50">{children}</main>
        </div>
        <TailwindIndicator />
      </Providers>
    </>
  );
}
