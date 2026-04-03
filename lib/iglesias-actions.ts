'use server'

import { getSupabaseServer } from '@/lib/supabase-server'
import { normalizarCoordenadas } from '@/lib/coordenadas'
import { guardarUbicacionUsuario } from '@/lib/rutas-actions'
export interface IglesiaCercana {
  id: string
  nombre: string
  direccion: string
  latitud: number
  longitud: number
  distancia_metros: number
}

function toNumber(value: unknown) {
  if (typeof value === 'number') return value
  if (typeof value === 'string' && value.trim() !== '') {
    const numeric = Number(value)
    return Number.isFinite(numeric) ? numeric : null
  }
  return null
}

function toRow(data: unknown): Record<string, unknown> | null {
  if (Array.isArray(data)) {
    const first = data[0]
    return first && typeof first === 'object' ? (first as Record<string, unknown>) : null
  }

  if (!data || typeof data !== 'object') {
    return null
  }

  const row = data as Record<string, unknown>

  if (row.data && typeof row.data === 'object') {
    return row.data as Record<string, unknown>
  }

  return row
}

function toText(value: unknown) {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return ''
}

function normalizarIglesiaCercana(data: unknown): IglesiaCercana | null {
  const row = toRow(data)

  if (!row) {
    return null
  }

  const latitud = toNumber(row.latitud ?? row.latitude ?? row.lat ?? row.y)
  const longitud = toNumber(row.longitud ?? row.longitude ?? row.lng ?? row.lon ?? row.x)
  const distanciaMetros = toNumber(
    row.distancia_metros ?? row.distance_meters ?? row.distance ?? row.distancia
  )

  const nombre = toText(
    row.nombre ?? row.name ?? row.iglesia ?? row.iglesia_nombre ?? 'Iglesia'
  )
  const direccion = toText(
    row.direccion ?? row.address ?? row.domicilio ?? row.ubicacion ?? ''
  )

  if (!nombre && !direccion && latitud === null && longitud === null) {
    console.error('Payload inválido en iglesia_mas_cercana', row)
    return null
  }

  return {
    id: String(row.id ?? row.iglesia_id ?? row.church_id ?? ''),
    nombre: nombre || 'Iglesia',
    direccion,
    latitud: latitud ?? Number.NaN,
    longitud: longitud ?? Number.NaN,
    distancia_metros: distanciaMetros ?? 0
  }
}

export async function obtenerIglesiaMasCercana(
  lat: number,
  lng: number
): Promise<IglesiaCercana | null> {
  const coords = normalizarCoordenadas({
    lat,
    lng
  })

  await guardarUbicacionUsuario({
    userLat: coords.lat,
    userLng: coords.lng
  })

  const supabase = await getSupabaseServer()

  const { data, error } = await supabase
    .rpc('iglesia_mas_cercana', {
      user_lat: coords.lat,
      user_lng: coords.lng
    })
    .single()

  if (error) {
    console.error('Error RPC iglesia_mas_cercana_knn', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      lat,
      lng
    })
    throw new Error(`Error obteniendo iglesia cercana: ${error.message}`)
  }

  return normalizarIglesiaCercana(data)
}