'use client'

import { useEffect, useState } from 'react'
import { obtenerIglesiaMasCercana, IglesiaCercana } from '@/lib/iglesias-actions'
import { getPositionFromWatch } from '@/lib/geolocation-client'

function parseGeolocationError(error: unknown) {
  if (!(error instanceof GeolocationPositionError)) {
    return error instanceof Error ? error.message : 'No se pudo obtener la iglesia cercana'
  }
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Permite el acceso a tu ubicación para encontrar la iglesia más cercana.'
    case error.POSITION_UNAVAILABLE:
      return 'No se pudo determinar tu ubicación en este momento.'
    case error.TIMEOUT:
      return 'Se agotó el tiempo al intentar obtener tu ubicación. Intenta de nuevo.'
    default:
      return 'No se pudo obtener la iglesia cercana'
  }
}

function construirGoogleMapsUrl(iglesia: IglesiaCercana) {
  const lat = Number(iglesia.latitud)
  const lng = Number(iglesia.longitud)

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
  }

  const query = [iglesia.nombre, iglesia.direccion].filter(Boolean).join(', ')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export default function IglesiaCercanaComponent() {

  const [iglesia, setIglesia] = useState<IglesiaCercana | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    cargar(isMounted)

    return () => {
      isMounted = false
    }
  }, [])

  async function cargar(isMounted = true) {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización')
      setIglesia(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const posicion = await getPositionFromWatch({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      })

      const { latitude, longitude } = posicion.coords
      const data = await obtenerIglesiaMasCercana(latitude, longitude)

      if (isMounted) {
        setIglesia(data)
      }
    } catch (error) {
      if (isMounted) {
        setIglesia(null)
        setError(parseGeolocationError(error))
      }
    } finally {
      if (isMounted) {
        setLoading(false)
      }
    }
  }

  if (loading) {
    return <p className="text-center p-6">📍 Buscando iglesia cercana...</p>
  }

  if (!iglesia) {
    return <p>{error ?? 'No se encontró iglesia'}</p>
  }

  const distancia =
    iglesia.distancia_metros < 1000
      ? `${Math.round(iglesia.distancia_metros)} m`
      : `${(iglesia.distancia_metros / 1000).toFixed(2)} km`

  const googleMapsUrl = construirGoogleMapsUrl(iglesia)

  return (

    <div className="max-w-md mx-auto bg-white shadow-xl rounded-xl p-6">

      <h2 className="text-xl font-bold text-indigo-700">
        ⛪ Iglesia más cercana
      </h2>

      <p className="mt-3 font-semibold text-lg">
        {iglesia.nombre}
      </p>

      <p className="text-gray-600 text-sm">
        {iglesia.direccion}
      </p>

      <p className="mt-4 font-bold text-indigo-600">
        Distancia: {distancia}
      </p>

      <div className="mt-6 space-y-3">

        <button
          onClick={() => {
            void cargar()
          }}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
        >
          📍 Actualizar ubicación
        </button>

        <a
          href={googleMapsUrl}
          target="_blank"
          className="block w-full text-center bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
        >
          🚶‍♂️ Cómo llegar
        </a>

      </div>

    </div>
  )
}