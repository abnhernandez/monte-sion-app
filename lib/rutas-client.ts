import { guardarUbicacionUsuario } from "@/lib/rutas-actions"
import { getPositionFromWatch } from "@/lib/geolocation-client"

export const CHURCH_COORDS = {
  lat: 17.077605,
  lng: -96.762161,
}

const ROUTE_MAPS_VIEW = {
  lat: 17.0705996,
  lng: -96.7668136,
  zoom: 15,
}

const DEFAULT_ROUTE_DEPARTURE_UNIX_SECONDS = 1772298000

const DEFAULT_ROUTE_QUERY_SUFFIX =
  "entry=ttu&g_ep=EgoyMDI2MDIyNS4wIKXMDSoASAFQAw%3D%3D"

function buildEventDirectionsUrl({
  originLat,
  originLng,
  departureUnixSeconds = DEFAULT_ROUTE_DEPARTURE_UNIX_SECONDS,
}: {
  originLat: number
  originLng: number
  departureUnixSeconds?: number
}) {
  return `https://www.google.com/maps/dir/${originLat},${originLng}/${CHURCH_COORDS.lat},${CHURCH_COORDS.lng}/@${ROUTE_MAPS_VIEW.lat},${ROUTE_MAPS_VIEW.lng},${ROUTE_MAPS_VIEW.zoom}z/data=!3m1!4b1!4m6!4m5!2m3!6e0!7e2!8j${departureUnixSeconds}!3e0?${DEFAULT_ROUTE_QUERY_SUFFIX}`
}

export type OpenRouteToChurchOptions = {
  accuracyThresholdMeters?: number
  saveUserLocation?: boolean
  fallbackToDestinationOnlyOnError?: boolean
}

export type OpenRouteToChurchResult = {
  opened: boolean
  usedFallback: boolean
  errorMessage: string | null
}

function buildDestinationOnlyUrl() {
  return `https://www.google.com/maps/search/?api=1&query=${CHURCH_COORDS.lat},${CHURCH_COORDS.lng}`
}

export function openDestinationOnlyRoute() {
  window.open(buildDestinationOnlyUrl(), "_blank", "noopener,noreferrer")
}

function createResult({
  opened,
  usedFallback,
  errorMessage,
}: OpenRouteToChurchResult): OpenRouteToChurchResult {
  return { opened, usedFallback, errorMessage }
}

function createError(message: string) {
  return new Error(message)
}

function handleRouteError(
  error: unknown,
  options?: OpenRouteToChurchOptions,
): OpenRouteToChurchResult {
  const fallbackToDestinationOnlyOnError = options?.fallbackToDestinationOnlyOnError ?? false
  const message = error instanceof Error ? error.message : "Ocurrió un error inesperado"

  if (fallbackToDestinationOnlyOnError) {
    openDestinationOnlyRoute()
    return createResult({
      opened: true,
      usedFallback: true,
      errorMessage: message,
    })
  }

  if (options) {
    return createResult({
      opened: false,
      usedFallback: false,
      errorMessage: message,
    })
  }

  throw createError(message)
}

export async function openRouteToChurch(
  options?: OpenRouteToChurchOptions,
): Promise<OpenRouteToChurchResult> {
  const accuracyThresholdMeters = options?.accuracyThresholdMeters
  const saveUserLocation = options?.saveUserLocation ?? true

  try {
    if (!navigator.geolocation) {
      throw createError("Tu navegador no soporta geolocalización")
    }

    const position = await getPositionFromWatch({
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
      requiredAccuracyMeters:
        typeof accuracyThresholdMeters === "number" ? accuracyThresholdMeters : undefined,
    })
    const { latitude, longitude, accuracy } = position.coords

    if (typeof accuracyThresholdMeters === "number" && accuracy > accuracyThresholdMeters) {
      throw createError(
        "No se pudo obtener una ubicación precisa. Intenta nuevamente en un área con mejor señal.",
      )
    }

    if (saveUserLocation) {
      await guardarUbicacionUsuario({
        userLat: latitude,
        userLng: longitude,
      })
    }

    const mapsUrl = buildEventDirectionsUrl({
      originLat: latitude,
      originLng: longitude,
    })

    window.open(mapsUrl, "_blank", "noopener,noreferrer")

    return createResult({
      opened: true,
      usedFallback: false,
      errorMessage: null,
    })
  } catch (error) {
    return handleRouteError(error, options)
  }
}