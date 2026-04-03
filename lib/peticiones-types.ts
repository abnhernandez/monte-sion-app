export const ESTADOS_PETICION = [
  "Recibida",
  "Pendiente",
  "En proceso de oración",
  "Completada",
  "Cerrada",
  "Resuelta",
] as const

export type EstadoPeticion = (typeof ESTADOS_PETICION)[number]