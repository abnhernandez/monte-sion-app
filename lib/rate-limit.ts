const map = new Map<string, number[]>()

export function rateLimit(key: string, limit = 3, windowMs = 60000) {
  const now = Date.now()
  const hits = map.get(key) || []
  const recent = hits.filter(t => now - t < windowMs)

  if (recent.length >= limit) {
    throw new Error("Demasiadas solicitudes, intenta más tarde")
  }

  recent.push(now)
  map.set(key, recent)
}