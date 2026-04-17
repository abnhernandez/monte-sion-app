// Centralized logging service
// Provides structured logging with circular buffer, Sentry integration support

interface LogEntry {
  timestamp: Date
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  context?: string
  data?: Record<string, unknown>
  url?: string
  userAgent?: string
}

const BUFFER_SIZE = 50
const MAX_LOG_SIZE = 100000 // 100KB max for local storage

class Logger {
  private buffer: LogEntry[] = []
  private isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development'

  private addToBuffer(entry: LogEntry) {
    this.buffer.push(entry)
    if (this.buffer.length > BUFFER_SIZE) {
      this.buffer.shift()
    }

    // Auto-save to localStorage if available
    try {
      if (typeof localStorage !== 'undefined') {
        const logsJson = JSON.stringify(this.buffer)
        if (logsJson.length < MAX_LOG_SIZE) {
          localStorage.setItem('monte_sion_logs', logsJson)
        }
      }
    } catch (e) {
      // Silently fail if localStorage is unavailable
    }
  }

  private formatLog(entry: LogEntry): string {
    const time = entry.timestamp.toISOString()
    const level = entry.level.toUpperCase().padEnd(5)
    const msg =
      entry.context && entry.data
        ? `[${entry.context}] ${entry.message}: ${JSON.stringify(entry.data)}`
        : entry.context
          ? `[${entry.context}] ${entry.message}`
          : entry.message

    return `${time} ${level} ${msg}`
  }

  debug(message: string, context?: string, data?: Record<string, unknown>) {
    const entry: LogEntry = {
      timestamp: new Date(),
      level: 'debug',
      message,
      context,
      data,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent:
        typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    }

    this.addToBuffer(entry)

    if (this.isDev) {
      console.debug(this.formatLog(entry))
    }
  }

  info(message: string, context?: string, data?: Record<string, unknown>) {
    const entry: LogEntry = {
      timestamp: new Date(),
      level: 'info',
      message,
      context,
      data,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent:
        typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    }

    this.addToBuffer(entry)

    if (this.isDev) {
      console.info(this.formatLog(entry))
    }
  }

  warn(message: string, context?: string, data?: Record<string, unknown>) {
    const entry: LogEntry = {
      timestamp: new Date(),
      level: 'warn',
      message,
      context,
      data,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent:
        typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    }

    this.addToBuffer(entry)
    console.warn(this.formatLog(entry))
  }

  error(message: string, context?: string, data?: Record<string, unknown> | Error) {
    let errorData = data
    if (data instanceof Error) {
      errorData = {
        message: data.message,
        stack: data.stack,
      }
    }

    const entry: LogEntry = {
      timestamp: new Date(),
      level: 'error',
      message,
      context,
      data: errorData as Record<string, unknown> | undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent:
        typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    }

    this.addToBuffer(entry)
    console.error(this.formatLog(entry))
  }

  getBuffer(): LogEntry[] {
    return [...this.buffer]
  }

  clearBuffer() {
    this.buffer = []
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('monte_sion_logs')
      }
    } catch (e) {
      // Silently fail
    }
  }

  async flushToServer(endpoint: string = '/api/logs') {
    if (this.buffer.length === 0) return

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.buffer),
      })
      this.clearBuffer()
    } catch (error) {
      console.error('Failed to flush logs to server:', error)
    }
  }
}

export const logger = new Logger()
