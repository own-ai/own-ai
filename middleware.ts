import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

import { isSubdomainMode, labPath } from "./lib/urls";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Get hostname of request (e.g. demo.ownai.com, demo.localhost:3000)
  let hostname = req.headers
    .get("host")!
    .replace("localhost:3000", `${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`);

  // special case for Vercel preview deployment URLs
  if (
    hostname.includes("---") &&
    hostname.endsWith(`.${process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX}`)
  ) {
    hostname = `${hostname.split("---")[0]}.${
      process.env.NEXT_PUBLIC_ROOT_DOMAIN
    }`;
  }

  const searchParams = req.nextUrl.searchParams.toString();
  const path = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ""
  }`;

  // rewrites for lab pages
  if (
    (isSubdomainMode() &&
      hostname == `lab.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) ||
    (!isSubdomainMode() && path.startsWith("/lab"))
  ) {
    const session = await getToken({ req });
    if (!session && url.pathname !== labPath("/login")) {
      return NextResponse.redirect(new URL(labPath("/login"), req.url));
    } else if (session && url.pathname == labPath("/login")) {
      return NextResponse.redirect(new URL(labPath("/"), req.url));
    }
    return NextResponse.rewrite(
      new URL(
        `${isSubdomainMode() ? "/lab" : ""}${path === "/" ? "" : path}`,
        req.url,
      ),
    );
  }

  if (!isSubdomainMode() && path.startsWith("/ai/")) {
    return NextResponse.next();
  }

  // rewrite everything else to /ai/[domain]/ dynamic route
  return NextResponse.rewrite(new URL(`/ai/${hostname}${path}`, req.url));
}
