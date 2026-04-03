"use client"

import { useState } from "react"
import { openRouteToChurch } from "@/lib/rutas-client"

export function RutaTemplo() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const guardarUbicacion = async () => {
    setLoading(true)
    setError(null)

    const result = await openRouteToChurch({
      accuracyThresholdMeters: 50,
      saveUserLocation: true,
      fallbackToDestinationOnlyOnError: false,
    })

    if (result.errorMessage) {
      setError(result.errorMessage)
    }

    setLoading(false)
  }

  return (
    <div className="space-y-3 max-w-md">
      <button
        className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white"
        onClick={guardarUbicacion}
        disabled={loading}
      >
        {loading ? "Preparando ruta..." : "Abrir ruta en Maps"}
      </button>

      {loading && <p className="text-xs text-neutral-500">Redirigiendo a Google Maps</p>}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}