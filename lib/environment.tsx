import va from "@vercel/analytics";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export function isDeployed() {
  return process.env.NODE_ENV !== "development";
}

export function isVercel() {
  return process.env.VERCEL === "1" || process.env.VERCEL === "true";
}

export function isVercelAnalyticsEnabled() {
  return (
    process.env.NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS === "1" ||
    process.env.NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS === "true"
  );
}

export function isVercelSpeedInsightsEnabled() {
  return (
    process.env.NEXT_PUBLIC_ENABLE_VERCEL_SPEED_INSIGHTS === "1" ||
    process.env.NEXT_PUBLIC_ENABLE_VERCEL_SPEED_INSIGHTS === "true"
  );
}

export function isImageUploadEnabled() {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

export function reportEvent(name: string, properties?: any) {
  if (isVercelAnalyticsEnabled()) {
    va.track(name, properties);
  }
}

export function EnvironmentScripts() {
  return (
    <>
      {isVercelAnalyticsEnabled() ? <Analytics /> : null}
      {isVercelSpeedInsightsEnabled() ? <SpeedInsights /> : null}
    </>
  );
}
