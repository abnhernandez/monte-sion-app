'use client'

import { useState, useEffect, useCallback } from 'react'
import { logger } from '@/lib/logger'

export interface SafeAsyncDataState<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
}

interface UseSafeAsyncDataOptions<T> {
  fallbackValue?: T | null
  retryCount?: number
  retryDelay?: number
  onError?: (error: Error) => void
}

/**
 * Hook for safe async data fetching with automatic retries
 * Prevents undefined data errors and provides loading/error states
 *
 * @example
 * const { data, isLoading, error } = useSafeAsyncData(
 *   () => fetchData(),
 *   { retryCount: 2, fallbackValue: [] }
 * )
 */
export function useSafeAsyncData<T>(
  fetchFn: () => Promise<T>,
  {
    fallbackValue = null,
    retryCount = 2,
    retryDelay = 1000,
    onError,
  }: UseSafeAsyncDataOptions<T> = {}
): SafeAsyncDataState<T> {
  const [state, setState] = useState<SafeAsyncDataState<T>>({
    data: fallbackValue,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    let isMounted = true
    let retries = 0
    let retryTimeout: NodeJS.Timeout | null = null

    const fetchWithRetry = async () => {
      try {
        const data = await fetchFn()

        // Validate data is not undefined
        if (data === undefined) {
          throw new Error('Fetched data is undefined')
        }

        if (isMounted) {
          setState({ data, isLoading: false, error: null })
          logger.info('Data fetched successfully', 'useSafeAsyncData', {
            hasData: !!data,
          })
        }
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error(String(err))

        if (retries < retryCount) {
          retries++
          const delay = Math.pow(2, retries - 1) * retryDelay
          logger.warn(
            `Fetch failed, retrying in ${delay}ms`,
            'useSafeAsyncData',
            {
              attempt: retries,
              error: error.message,
            }
          )
          retryTimeout = setTimeout(fetchWithRetry, delay)
        } else {
          logger.error(
            `Fetch failed after ${retryCount + 1} attempts`,
            'useSafeAsyncData',
            {
              error: error.message,
            }
          )

          if (isMounted) {
            setState({
              data: fallbackValue,
              isLoading: false,
              error,
            })

            if (onError) {
              onError(error)
            }
          }
        }
      }
    }

    fetchWithRetry()

    return () => {
      isMounted = false
      if (retryTimeout) {
        clearTimeout(retryTimeout)
      }
    }
  }, [fetchFn, fallbackValue, retryCount, retryDelay, onError])

  return state
}
