import { cookies } from "next/headers"
import {
  readQueryParamsFromObject,
  readTrackedQueryParamsFromCookieString,
  type TrackedQueryParams,
  type QueryParamsMap,
} from "@/lib/query-params"

export async function getServerTrackedQueryParams(): Promise<TrackedQueryParams> {
  const cookieStore = await cookies()
  const cookieString = cookieStore
    .getAll()
    .map(({ name, value }) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
    .join("; ")

  return readTrackedQueryParamsFromCookieString(cookieString)
}

export type ServerQueryParamValue = string | string[] | undefined

export type ServerQueryParams = Record<string, ServerQueryParamValue>

type SearchParamsInput =
  | ServerQueryParams
  | URLSearchParams
  | Promise<ServerQueryParams | URLSearchParams>

export async function getServerQueryParams(searchParams: SearchParamsInput): Promise<QueryParamsMap> {
  const resolved = await searchParams
  const flattened: Record<string, string | number | boolean | null | undefined> = {}

  if (resolved instanceof URLSearchParams) {
    for (const [key, value] of resolved.entries()) {
      flattened[key] = value
    }

    return readQueryParamsFromObject(flattened)
  }

  for (const [key, value] of Object.entries(resolved)) {
    if (Array.isArray(value)) {
      flattened[key] = value[0]
      continue
    }

    flattened[key] = value
  }

  return readQueryParamsFromObject(flattened)
}