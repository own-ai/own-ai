import NextAuth from "next-auth";
import { NextRequest } from "next/server";

import { authOptions } from "@/lib/auth";

// Handler for custom domains.
// We don't set the cookie domain to avoid it being rejected.
const customDomainHandler = NextAuth(authOptions);

// If the user signs in to the root domain or any of its subdomains,
// set the cookie domain in order to apply it and the login state to all subdomains.
// This allows the user to sign in only once for all subdomains.
const rootDomainHandler = NextAuth({
  ...authOptions,
  cookies: {
    ...authOptions.cookies,
    sessionToken: {
      ...authOptions.cookies!.sessionToken!,
      options: {
        ...authOptions.cookies!.sessionToken!.options,
        domain: `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
      },
    },
  },
});

// The edge runtime needs next-auth 5
// export const runtime = "edge";

function handle(...args: any[]) {
  const request: NextRequest = args[0];
  const host = request.headers.get("host");

  if (
    host === process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
    host?.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)
  ) {
    return rootDomainHandler(...args);
  }

  return customDomainHandler(...args);
}

export { handle as GET, handle as POST };
