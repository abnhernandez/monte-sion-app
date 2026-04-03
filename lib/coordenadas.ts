const COORDINATE_DECIMALS = 6

function normalizeCoordinate(value: number) {
  return Number(value.toFixed(COORDINATE_DECIMALS))
}

export function normalizarCoordenadas({
  lat,
  lng,
}: {
  lat: number
  lng: number
}) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error("La ubicación contiene coordenadas inválidas")
  }

  if (lat < -90 || lat > 90) {
    throw new Error("La latitud está fuera de rango")
  }

  if (lng < -180 || lng > 180) {
    throw new Error("La longitud está fuera de rango")
  }

  return {
    lat: normalizeCoordinate(lat),
    lng: normalizeCoordinate(lng),
  }
}