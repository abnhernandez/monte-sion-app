export const TRACKED_QUERY_PARAM_KEYS = [
  "ref",
  "utm_source",
  "utm_campaign",
  "user",
] as const

export type TrackedQueryParamKey = (typeof TRACKED_QUERY_PARAM_KEYS)[number]

export type QueryParamsMap = Record<string, string>

export type TrackedQueryParams = Partial<Record<TrackedQueryParamKey, string>>

export const QUERY_PARAMS_LOCAL_STORAGE_KEY = "monte-sion:query-params:tracked"
export const QUERY_PARAMS_SESSION_STORAGE_KEY = "monte-sion:query-params:last-seen"
export const QUERY_PARAMS_COOKIE_PREFIX = "ms_qp_"

const MAX_QUERY_VALUE_LENGTH = 200

export function sanitizeQueryKey(key: string) {
  const trimmed = key.trim()

  if (!trimmed) {
    return null
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return null
  }

  return trimmed
}

export function sanitizeQueryValue(value: string | null | undefined) {
  if (typeof value !== "string") {
    return null
  }

  const normalized = value.replace(/[\u0000-\u001F\u007F]/g, "").trim()

  if (!normalized) {
    return null
  }

  return normalized.length > MAX_QUERY_VALUE_LENGTH
    ? normalized.slice(0, MAX_QUERY_VALUE_LENGTH)
    : normalized
}

export function readQueryParamsFromSearchParams(searchParams: URLSearchParams) {
  const params: QueryParamsMap = {}

  for (const [rawKey, rawValue] of searchParams.entries()) {
    const key = sanitizeQueryKey(rawKey)
    const value = sanitizeQueryValue(rawValue)

    if (!key || value === null) {
      continue
    }

    params[key] = value
  }

  return params
}

export function readQueryParamsFromObject(
  input: Record<string, unknown>
) {
  const params: QueryParamsMap = {}

  for (const [rawKey, rawValue] of Object.entries(input)) {
    const key = sanitizeQueryKey(rawKey)

    if (!key || rawValue === null || rawValue === undefined) {
      continue
    }

    const value = sanitizeQueryValue(String(rawValue))

    if (value === null) {
      continue
    }

    params[key] = value
  }

  return params
}

export function mergeQueryParams(...sources: Array<QueryParamsMap | null | undefined>) {
  return sources.reduce<QueryParamsMap>((merged, source) => {
    if (!source) {
      return merged
    }

    return { ...merged, ...source }
  }, {})
}

export function pickTrackedQueryParams(params: QueryParamsMap) {
  const tracked: TrackedQueryParams = {}

  for (const key of TRACKED_QUERY_PARAM_KEYS) {
    const value = params[key]

    if (value) {
      tracked[key] = value
    }
  }

  return tracked
}

export function getParam(params: QueryParamsMap, key: string) {
  return params[key]
}

export function getAllParams(params: QueryParamsMap) {
  return { ...params }
}

export function parseStoredQueryParams(rawValue: string | null) {
  if (!rawValue) {
    return {}
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {}
    }

    return readQueryParamsFromObject(parsed as Record<string, unknown>)
  } catch {
    return {}
  }
}

export function readStoredQueryParams(storage: Storage | undefined, storageKey: string) {
  if (!storage) {
    return {}
  }

  try {
    return parseStoredQueryParams(storage.getItem(storageKey))
  } catch {
    return {}
  }
}

export function writeStoredQueryParams(
  storage: Storage | undefined,
  storageKey: string,
  params: QueryParamsMap
) {
  if (!storage) {
    return
  }

  try {
    storage.setItem(storageKey, JSON.stringify(params))
  } catch {
    // Ignore storage quota and private browsing errors.
  }
}

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function parseCookieString(cookieString: string) {
  const cookies: Record<string, string> = {}

  for (const pair of cookieString.split(";")) {
    const [rawKey, ...rawValueParts] = pair.split("=")

    if (!rawKey || rawValueParts.length === 0) {
      continue
    }

    const key = safeDecodeURIComponent(rawKey.trim())
    const value = safeDecodeURIComponent(rawValueParts.join("=").trim())

    if (!key) {
      continue
    }

    cookies[key] = value
  }

  return cookies
}

export function getTrackedQueryParamCookieName(key: TrackedQueryParamKey) {
  return `${QUERY_PARAMS_COOKIE_PREFIX}${key}`
}

export function readTrackedQueryParamsFromCookieString(cookieString: string) {
  const cookieMap = parseCookieString(cookieString)
  const tracked: TrackedQueryParams = {}

  for (const key of TRACKED_QUERY_PARAM_KEYS) {
    const value = sanitizeQueryValue(cookieMap[getTrackedQueryParamCookieName(key)])

    if (value) {
      tracked[key] = value
    }
  }

  return tracked
}

export function writeTrackedQueryParamsToCookies(
  responseCookies: {
    set: (
      name: string,
      value: string,
      options?: {
        path?: string
        sameSite?: "lax" | "strict" | "none"
        maxAge?: number
        secure?: boolean
      }
    ) => void
  },
  params: TrackedQueryParams,
  secure: boolean
) {
  for (const [key, value] of Object.entries(params) as Array<[
    TrackedQueryParamKey,
    string
  ]>) {
    responseCookies.set(getTrackedQueryParamCookieName(key), value, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 90,
      secure,
    })
  }
}