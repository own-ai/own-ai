import { isDeployed } from "./environment";

export function isSubdomainMode() {
  return (
    process.env.NEXT_PUBLIC_ENABLE_SUBDOMAINS === "1" ||
    process.env.NEXT_PUBLIC_ENABLE_SUBDOMAINS === "true"
  );
}

export function aiPath(domain: string, path: string) {
  return isSubdomainMode() ? path : `/ai/${domain}${path}`;
}

export function labPath(path: string) {
  return isSubdomainMode() ? path : `/lab${path}`;
}

export function getAiUrlDisplay(ai: {
  ownDomain: string | null;
  subdomain: string | null;
}) {
  if (ai.subdomain === "default") {
    return process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  }

  if (ai.ownDomain) {
    return ai.ownDomain;
  }

  if (isSubdomainMode()) {
    return `${ai.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;
  }

  return `${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/ai/${ai.subdomain}`;
}

export function getAiUrlHref(ai: {
  ownDomain: string | null;
  subdomain: string | null;
}) {
  if (isDeployed()) {
    return `https://${getAiUrlDisplay(ai)}`;
  }

  if (ai.subdomain === "default") {
    return "http://localhost:3000";
  }

  if (isSubdomainMode()) {
    return `http://${ai.subdomain}.localhost:3000`;
  }

  return `http://localhost:3000/ai/${ai.subdomain}`;
}

export function getLabUrlHref() {
  if (isSubdomainMode()) {
    return isDeployed()
      ? `https://lab.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
      : "http://lab.localhost:3000";
  }

  return isDeployed()
    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/lab`
    : "http://localhost:3000/lab";
}
