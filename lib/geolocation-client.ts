type WatchPositionWithAccuracyOptions = PositionOptions & {
  requiredAccuracyMeters?: number
}

export function getPositionFromWatch(
  options: WatchPositionWithAccuracyOptions = {},
): Promise<GeolocationPosition> {
  if (!navigator.geolocation) {
    return Promise.reject(new Error("Tu navegador no soporta geolocalización"))
  }

  const {
    requiredAccuracyMeters,
    timeout = 15000,
    enableHighAccuracy = true,
    maximumAge = 0,
  } = options

  return new Promise((resolve, reject) => {
    let watchId: number | null = null
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const cleanup = () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }

      if (timeoutId !== null) {
        clearTimeout(timeoutId)
      }
    }

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (
          typeof requiredAccuracyMeters === "number" &&
          position.coords.accuracy > requiredAccuracyMeters
        ) {
          return
        }

        cleanup()
        resolve(position)
      },
      (error) => {
        cleanup()
        reject(error)
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      },
    )

    timeoutId = setTimeout(() => {
      cleanup()
      reject(new Error("Se agotó el tiempo al intentar obtener tu ubicación."))
    }, timeout + 1000)
  })
}
