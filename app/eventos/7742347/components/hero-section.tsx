"use client"

import { useState } from "react"
import { CalendarDays, MapPin, Clock, ArrowDown } from "lucide-react"
import { openRouteToChurch } from "@/lib/rutas-client"

export function HeroSection() {
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
    <section
      id="inicio"
      className="relative py-28 md:py-36"
    >
      <div className="mx-auto max-w-5xl px-6 text-center">

        {/* OVERLINE */}
        <p className="text-xs uppercase tracking-[0.4em] text-primary/80">
          CADA DECISIÓN DEFINE TU FUTURO
        </p>

        {/* TITLE */}
        <h1
          className="mt-6 font-serif text-4xl md:text-6xl lg:text-7xl 
          font-semibold leading-[1.05] tracking-tight text-foreground"
        >
          <span className="block">
            Las decisiones más importantes
          </span>

          <span className="mt-3 block text-primary">
            de tu vida
          </span>
        </h1>

        {/* DESCRIPTION */}
        <p className="mt-8 mx-auto max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
          Un encuentro diseñado para ayudarte a tomar decisiones que definirán
          tu propósito, fortalecerán tu fe y transformarán tu futuro.
        </p>

        {/* VERSE */}
        <div className="mt-12 mx-auto max-w-xl text-left">
          <blockquote className="border-l-2 border-primary/40 pl-6">
            <p className="text-base text-foreground leading-relaxed">
              Escogeos hoy a quién sirváis…
            </p>

            <p className="mt-2 text-primary font-medium">
              pero yo y mi casa serviremos al Señor.
            </p>

            <cite className="mt-4 block text-xs uppercase tracking-widest text-muted-foreground not-italic">
              Josué 24:15
            </cite>
          </blockquote>
        </div>

        {/* EVENT INFO */}
        <div className="mt-14 flex flex-wrap justify-center gap-4">
          <InfoPill icon={<CalendarDays />} text="Sábado, 28 de febrero" />
          <InfoPill icon={<Clock />} text="6:00 PM" />
          <InfoPill icon={<MapPin />} text="Iglesia Monte Sion" />
        </div>

        {/* CTA */}
        <div className="mt-14 flex flex-col sm:flex-row justify-center gap-4">
          <a
            href="#agenda"
            className="group inline-flex items-center justify-center gap-2 
            rounded-full bg-primary px-10 py-4 text-base font-semibold 
            text-primary-foreground transition-all duration-300 
            hover:scale-[1.03]"
          >
            Ver agenda
            <ArrowDown className="size-4 transition-transform duration-300 group-hover:translate-y-1" />
          </a>

          <button
            onClick={handleGetDirections}
            disabled={isLoading}
            className="inline-flex items-center justify-center 
            rounded-full border border-border px-10 py-4 
            text-base font-medium 
            transition-all duration-300 
            hover:border-primary hover:text-primary
            disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Obteniendo indicaciones..." : "Cómo llegar"}
          </button>
        </div>

        {errorMessage && (
          <p className="mt-6 text-sm text-red-500">
            {errorMessage}
          </p>
        )}

      </div>
    </section>
  )
}

function InfoPill({
  icon,
  text,
}: {
  icon: React.ReactNode
  text: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-full 
      border border-border px-5 py-3 text-sm text-muted-foreground">
      <span className="text-primary">{icon}</span>
      <span>{text}</span>
    </div>
  )
}