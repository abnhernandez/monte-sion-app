"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { usePathname, useSearchParams } from "next/navigation"
import {
  getAllParams,
  getParam,
  mergeQueryParams,
  pickTrackedQueryParams,
  QUERY_PARAMS_LOCAL_STORAGE_KEY,
  QUERY_PARAMS_SESSION_STORAGE_KEY,
  readQueryParamsFromSearchParams,
  readStoredQueryParams,
  readTrackedQueryParamsFromCookieString,
  type QueryParamsMap,
  type TrackedQueryParams,
  writeStoredQueryParams,
} from "@/lib/query-params"

export type QueryParamsContextValue = {
  ready: boolean
  pathname: string
  params: QueryParamsMap
  trackedParams: TrackedQueryParams
  getParam: (key: string) => string | undefined
  getAllParams: () => QueryParamsMap
  refresh: () => void
}

const QueryParamsContext = createContext<QueryParamsContextValue | null>(null)

type QueryParamsProviderProps = {
  children: ReactNode
  stripFromUrlAfterCapture?: boolean
}

function readBrowserSnapshot(currentUrlParams: QueryParamsMap) {
  const sessionParams = readStoredQueryParams(
    window.sessionStorage,
    QUERY_PARAMS_SESSION_STORAGE_KEY
  )
  const localParams = readStoredQueryParams(
    window.localStorage,
    QUERY_PARAMS_LOCAL_STORAGE_KEY
  )
  const cookieParams = readTrackedQueryParamsFromCookieString(document.cookie)

  return mergeQueryParams(cookieParams, localParams, sessionParams, currentUrlParams)
}

function persistBrowserSnapshot(params: QueryParamsMap) {
  writeStoredQueryParams(window.sessionStorage, QUERY_PARAMS_SESSION_STORAGE_KEY, params)
}

function persistTrackedParams(trackedParams: TrackedQueryParams) {
  writeStoredQueryParams(
    window.localStorage,
    QUERY_PARAMS_LOCAL_STORAGE_KEY,
    trackedParams as QueryParamsMap
  )
}

function cleanUrl(pathname: string) {
  const hash = window.location.hash
  const target = `${pathname}${hash}`

  window.history.replaceState(window.history.state, "", target)
}

export function QueryParamsProvider({
  children,
  stripFromUrlAfterCapture = false,
}: QueryParamsProviderProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [refreshVersion, setRefreshVersion] = useState(0)
  const searchKey = searchParams.toString()

  const refresh = useCallback(() => {
    setRefreshVersion((current) => current + 1)
  }, [])

  const snapshot = useMemo<QueryParamsContextValue>(() => {
    void refreshVersion

    if (typeof window === "undefined") {
      return {
        ready: false,
        pathname,
        params: {},
        trackedParams: {},
        getParam: () => undefined,
        getAllParams: () => ({}),
        refresh,
      }
    }

    const currentUrlParams = readQueryParamsFromSearchParams(
      new URLSearchParams(searchKey)
    )
    const mergedParams = readBrowserSnapshot(currentUrlParams)
    const trackedParams = pickTrackedQueryParams(mergedParams)

    return {
      ready: true,
      pathname: window.location.pathname,
      params: mergedParams,
      trackedParams,
      getParam: (key: string) => getParam(mergedParams, key),
      getAllParams: () => getAllParams(mergedParams),
      refresh,
    }
  }, [pathname, refresh, refreshVersion, searchKey])

  useEffect(() => {
    const currentUrlParams = readQueryParamsFromSearchParams(searchParams)
    const mergedParams = readBrowserSnapshot(currentUrlParams)
    const trackedParams = pickTrackedQueryParams(mergedParams)

    if (Object.keys(currentUrlParams).length > 0) {
      persistBrowserSnapshot(currentUrlParams)
      persistTrackedParams(trackedParams)

      if (stripFromUrlAfterCapture) {
        cleanUrl(pathname)
      }
    }
  }, [pathname, refresh, searchParams, stripFromUrlAfterCapture])

  return (
    <QueryParamsContext.Provider value={snapshot}>
      {children}
    </QueryParamsContext.Provider>
  )
}

export function useQueryParams() {
  const context = useContext(QueryParamsContext)

  if (!context) {
    throw new Error("useQueryParams debe usarse dentro de QueryParamsProvider")
  }

  return context
}
