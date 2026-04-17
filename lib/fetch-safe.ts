import { logger } from './logger'

interface FetchOptions extends RequestInit {
  retries?: number
  timeout?: number
}

interface FetchSafeResponse<T> {
  success: boolean
  data: T | null
  error: Error | null
}

/**
 * Safe fetch wrapper with automatic retries and timeout
 * Throws error if all retries fail
 */
export async function fetchSafe<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { retries = 2, timeout = 10000, ...fetchOptions } = options
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${response.statusText}`
        )
      }

      const data = await response.json()

      if (data === null || data === undefined) {
        throw new Error('Response data is null or undefined')
      }

      if (attempt > 0) {
        logger.info(`Fetch succeeded after retry`, 'fetchSafe', {
          url,
          attempt: attempt + 1,
        })
      }

      return data as T
    } catch (error) {
      lastError =
        error instanceof Error
          ? error
          : new Error(String(error))

      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 100 // Exponential backoff
        logger.warn(`Fetch failed, retrying in ${delay}ms`, 'fetchSafe', {
          url,
          attempt: attempt + 1,
          error: lastError.message,
        })
        await new Promise((resolve) => setTimeout(resolve, delay))
      } else {
        logger.error(
          `Fetch failed after ${retries + 1} attempts`,
          'fetchSafe',
          {
            url,
            error: lastError.message,
          }
        )
      }
    }
  }

  throw lastError || new Error('Fetch failed: Unknown error')
}

/**
 * Safe fetch wrapper that returns null on error instead of throwing
 */
export async function fetchSafeOptional<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T | null> {
  try {
    return await fetchSafe<T>(url, options)
  } catch (error) {
    logger.warn(
      `Fetch returned null due to error`,
      'fetchSafeOptional',
      error instanceof Error ? { error: error.message } : {}
    )
    return null
  }
}
