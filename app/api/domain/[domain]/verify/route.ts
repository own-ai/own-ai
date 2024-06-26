import { NextResponse } from "next/server";

import {
  getConfigResponseFromVercel,
  getDomainResponseFromVercel,
  verifyDomainForVercel,
} from "@/lib/domains";
import { DomainVerificationStatusProps } from "@/lib/types";

export async function GET(
  _req: Request,
  { params }: { params: { domain: string } },
) {
  const domain = decodeURIComponent(params.domain);
  let status: DomainVerificationStatusProps = "Valid Configuration";

  const [domainJson, configJson] = await Promise.all([
    getDomainResponseFromVercel(domain),
    getConfigResponseFromVercel(domain),
  ]);

  if (domainJson?.error?.code === "not_found") {
    // domain not found on Vercel project
    status = "Domain Not Found";

    // unknown error
  } else if (domainJson.error) {
    status = "Unknown Error";

    // if domain is not verified, we try to verify now
  } else if (!domainJson.verified) {
    status = "Pending Verification";
    const verificationJson = await verifyDomainForVercel(domain);

    // domain was just verified
    if (verificationJson && verificationJson.verified) {
      status = "Valid Configuration";
    }
  } else if (configJson.misconfigured) {
    status = "Invalid Configuration";
  } else {
    status = "Valid Configuration";
  }

  return NextResponse.json({
    status,
    domainJson,
  });
}
