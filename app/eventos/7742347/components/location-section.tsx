"use client"

import { useState } from "react"
import { MapPin, Navigation } from "lucide-react"
import { openRouteToChurch } from "@/lib/rutas-client"

export function LocationSection() {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleGetDirections = async () => {
    try {
      setIsLoading(true)
      setErrorMessage(null)

      await openRouteToChurch()

    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage("Ocurrió un error inesperado")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section id="ubicacion" className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">

        {/* Header */}
        <div className="mb-16 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MapPin className="size-4 text-primary" />
            <span className="text-xs tracking-[0.35em] uppercase text-primary font-semibold">
              Ubicación
            </span>
          </div>

          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
            Cómo llegar
          </h2>

          <p className="mt-4 text-sm text-muted-foreground">
            Encuéntranos fácilmente el día del evento
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid gap-12 md:grid-cols-2 md:items-center">

          {/* Left Side */}
          <div className="space-y-6">

            <div>
              <h3 className="text-2xl font-semibold text-foreground">
                Iglesia Cristiana Monte Sion
              </h3>

              <p className="mt-3 text-muted-foreground leading-relaxed">
                Cuicatlán 184, Colonia Niños Héroes <br />
                Santa María Atzompa, 71222 <br />
                Oaxaca de Juárez, Oaxaca
              </p>
            </div>

            {/* Fecha & Hora */}
            <div className="flex gap-10 pt-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Fecha
                </p>
                <p className="text-lg font-semibold text-primary">
                  28 de Febrero
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Hora
                </p>
                <p className="text-lg font-semibold text-primary">
                  6:00 PM
                </p>
              </div>
            </div>

            {/* Botón */}
            <div className="pt-6">
              <button
                onClick={handleGetDirections}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all duration-300 hover:scale-[1.03] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Navigation className="size-4" />
                {isLoading ? "Obteniendo indicaciones..." : "¿Cómo llegar?"}
              </button>

              {/* Error */}
              {errorMessage && (
                <p className="mt-4 text-sm text-red-500">
                  {errorMessage}
                </p>
              )}
            </div>
          </div>

          {/* Right Side - Map */}
          <div className="relative overflow-hidden rounded-2xl border border-border shadow-md">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d61020.29608209698!2d-96.77745375502678!3d17.083972490407525!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85c719fbd77eb0a3%3A0x180a16d55bf14f4!2sIglesia%20Cristiana%20Monte%20Sion%20-%20Santa%20Mar%C3%ADa%20Atzompa%2C%20Oaxaca!5e0!3m2!1ses!2smx!4v1772179396215!5m2!1ses!2smx"
              width="100%"
              height="350"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
            />
          </div>

        </div>
      </div>
    </section>
  )
}