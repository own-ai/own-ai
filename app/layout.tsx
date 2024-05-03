import type { Viewport } from "next";

import { cn } from "@/lib/utils";
import { cal, inter } from "@/styles/fonts";
import "@/styles/globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(cal.variable, inter.variable)}>{children}</body>
    </html>
  );
}
