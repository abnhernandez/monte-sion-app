"use client"

import { useState } from "react"
import { MapPin, Navigation, Loader2 } from "lucide-react"
import { openDestinationOnlyRoute, openRouteToChurch } from "@/lib/rutas-client"

export function RouteToChurch() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGetRoute = async () => {
    setLoading(true)
    setError(null)

    const result = await openRouteToChurch({
      accuracyThresholdMeters: 100,
      saveUserLocation: true,
      fallbackToDestinationOnlyOnError: false,
    })

    if (result.errorMessage) {
      setError(result.errorMessage)
    }

    setLoading(false)
  }

  const handleOpenMapsDirectly = () => {
    openDestinationOnlyRoute()
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleGetRoute}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent/90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Obteniendo ruta...
            </>
          ) : (
            <>
              <Navigation className="h-4 w-4" />
              Cómo llegar
            </>
          )}
        </button>

        <button
          onClick={handleOpenMapsDirectly}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <MapPin className="h-4 w-4" />
          Ver en Maps
        </button>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
