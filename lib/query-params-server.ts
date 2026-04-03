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

export async function getServerQueryParams(searchParams: ServerQueryParams): Promise<QueryParamsMap> {
  const flattened: Record<string, string | number | boolean | null | undefined> = {}

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      flattened[key] = value[0]
      continue
    }

    flattened[key] = value
  }

  return readQueryParamsFromObject(flattened)
}