import type { QueryParamsMap } from "@/lib/query-params"

const SOCIAL_SOURCE_REDIRECTS: Record<string, string> = {
  whatsapp: "/registro",
  wa: "/registro",
  instagram: "/avisos",
  facebook: "/avisos",
  youtube: "/avisos",
  tiktok: "/avisos",
}

const SMART_ENTRYPOINTS = new Set([
  "/",
  "/home",
  "/avisos",
  "/login",
  "/registro",
])

function normalize(value: string | undefined) {
  return value?.trim().toLowerCase() ?? ""
}

export function resolveSmartRedirect(
  pathname: string,
  params: QueryParamsMap,
  options?: { authenticated?: boolean }
) {
  if (!SMART_ENTRYPOINTS.has(pathname)) {
    return null
  }

  const ref = normalize(params.ref)
  const utmSource = normalize(params.utm_source)
  const utmCampaign = normalize(params.utm_campaign)

  const routeTarget =
    SOCIAL_SOURCE_REDIRECTS[ref] ?? SOCIAL_SOURCE_REDIRECTS[utmSource] ?? null

  if ([ref, utmSource].some((value) => value === "whatsapp" || value === "wa")) {
    return pathname === "/registro" ? null : "/registro"
  }

  if (utmCampaign.includes("camp")) {
    return pathname === "/camp" ? null : "/camp"
  }

  if (routeTarget && routeTarget !== pathname) {
    return routeTarget
  }

  if (options?.authenticated && (ref || utmSource) && pathname !== "/dashboard") {
    return "/dashboard"
  }

  return null
}