'use client'

import React from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { logger } from '@/lib/logger'

type DefaultErrorFallbackProps = {
  error: Error
  resetErrorBoundary: () => void
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full p-8 border border-red-200 dark:border-red-800">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
          ¡Algo salió mal!
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-center text-sm mb-6">
          Nos disculpamos. Hemos registrado el error y estamos trabajando en ello.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6 p-3 bg-slate-100 dark:bg-slate-800 rounded text-xs text-gray-700 dark:text-gray-300 max-h-32 overflow-auto">
            <summary className="cursor-pointer font-semibold mb-2">
              Detalles del error (desarrollo)
            </summary>
            <pre className="whitespace-pre-wrap break-words font-mono">
              {error?.message}
            </pre>
          </details>
        )}

        <div className="flex gap-3">
          <button
            onClick={resetErrorBoundary}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
          <a
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium"
          >
            <Home className="w-4 h-4" />
            Inicio
          </a>
        </div>
      </div>
    </div>
  )
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  retryCount: number
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<DefaultErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState((prev) => ({
      errorInfo,
      retryCount: prev.retryCount + 1,
    }))

    logger.error('Error Boundary caught error', 'ErrorBoundary', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      retryCount: this.state.retryCount,
    })

    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  resetError = () => {
    logger.info('Error reset triggered', 'ErrorBoundary', {
      retryCount: this.state.retryCount,
    })
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent =
        this.props.fallback || DefaultErrorFallback

      if (this.state.retryCount >= 3) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full p-8 border border-red-200 dark:border-red-800">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h1 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
                Error persistente
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-center text-sm mb-6">
                Hemos intentado resolver el problema pero persiste. Por favor, recarga la página.
              </p>
              <a
                href="/"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
              >
                <Home className="w-4 h-4" />
                Volver al inicio
              </a>
            </div>
          </div>
        )
      }

      return (
        <FallbackComponent
          error={this.state.error}
          resetErrorBoundary={this.resetError}
        />
      )
    }

    return this.props.children
  }
}
