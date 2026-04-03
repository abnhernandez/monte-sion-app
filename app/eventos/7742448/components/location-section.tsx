"use client"

import { useState, useEffect } from "react"
import { MapPin, Navigation } from "lucide-react"
import { openRouteToChurch } from "@/lib/rutas-client"
import { motion, useAnimation } from "framer-motion"
import { useInView } from "react-intersection-observer"

export function LocationSection() {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const controls = useAnimation()
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true })

  useEffect(() => {
    if (inView) {
      controls.start({ opacity: 1, y: 0 })
    }
  }, [controls, inView])

  const handleGetDirections = async () => {
    try {
      setIsLoading(true)
      setErrorMessage(null)
      await openRouteToChurch()
    } catch (error: unknown) {
      if (error instanceof Error) setErrorMessage(error.message)
      else setErrorMessage("Ocurrió un error inesperado")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section
      id="ubicacion"
      className="relative overflow-hidden py-24 md:py-32 bg-[#14090c]"
      ref={ref}
    >
      {/* Fondo degradado */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#1a0f12] via-[#2a0b10] to-[#14090c]" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={controls}
        transition={{ duration: 1, ease: "easeOut" }}
        className="mx-auto max-w-6xl px-6"
      >

        {/* Header */}
        <div className="mb-16 text-center text-white">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MapPin className="size-4 text-amber-400" />
            <span className="text-xs tracking-[0.35em] uppercase text-amber-400 font-semibold">
              Ubicación
            </span>
          </div>

          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">
            Cómo llegar
          </h2>

          <p className="mt-4 text-sm text-amber-200/70">
            Encuéntranos fácilmente el día del evento
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid gap-12 md:grid-cols-2 md:items-center">

          {/* Left Side */}
          <div className="space-y-6 text-white">

            <div>
              <h3 className="text-2xl font-semibold text-amber-400">
                Iglesia Cristiana Monte Sion
              </h3>

              <p className="mt-3 text-white/70 leading-relaxed">
                Cuicatlán 184, Colonia Niños Héroes <br />
                Santa María Atzompa, 71222 <br />
                Oaxaca de Juárez, Oaxaca
              </p>
            </div>

            {/* Fecha & Hora */}
            <div className="flex gap-10 pt-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-white/50">
                  Fecha
                </p>
                <p className="text-lg font-semibold text-amber-400">
                  15 de marzo
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-white/50">
                  Hora
                </p>
                <p className="text-lg font-semibold text-amber-400">
                  11:00 AM
                </p>
              </div>
            </div>

            {/* Botón */}
            <div className="pt-6">
              <button
                onClick={handleGetDirections}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-medium text-black transition-all duration-300 hover:scale-[1.05] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Navigation className="size-4" />
                {isLoading ? "Obteniendo indicaciones..." : "Cómo llegar"}
              </button>

              {/* Error */}
              {errorMessage && (
                <p className="mt-4 text-sm text-red-400">
                  {errorMessage}
                </p>
              )}
            </div>
          </div>

          {/* Right Side - Map */}
          <div className="relative overflow-hidden rounded-2xl border border-amber-400/20 shadow-md">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d61020.29608209698!2d-96.77745375502678!3d17.083972490407525!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85c719fbd77eb0a3%3A0x180a16d55bf14f4!2sIglesia%20Cristiana%20Monte%20Sion%20-%20Santa%20Mar%C3%ADa%20Atzompa%2C%20Oaxaca!5e0!3m2!1ses!2smx!4v1772179396215!5m2!1ses!2smx"
              width="100%"
              height="350"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full rounded-2xl"
            />
          </div>

        </div>
      </motion.div>
    </section>
  )
}
