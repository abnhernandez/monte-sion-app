'use client'

import { useState, useCallback } from 'react'
import { logger } from '@/lib/logger'

export interface AsyncErrorState<T = void> {
  data: T | null
  error: Error | null
  isLoading: boolean
}

/**
 * Hook for handling errors in async operations
 * Complements Error Boundary for async errors
 *
 * @example
 * const { error, execute, isLoading } = useAsyncError()
 * const result = await execute(() => saveData())
 */
export function useAsyncError<T = void>() {
  const [state, setState] = useState<AsyncErrorState<T>>({
    data: null,
    error: null,
    isLoading: false,
  })

  const execute = useCallback(async (fn: () => Promise<T>) => {
    setState({ data: null, error: null, isLoading: true })

    try {
      const result = await fn()
      setState({ data: result, error: null, isLoading: false })
      return result
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error(String(err))
      setState({ data: null, error, isLoading: false })
      logger.error(
        'Async operation failed',
        'useAsyncError',
        {
          error: error.message,
        }
      )
      throw error
    }
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false })
  }, [])

  return {
    ...state,
    execute,
    reset,
    hasError: state.error !== null,
  }
}
