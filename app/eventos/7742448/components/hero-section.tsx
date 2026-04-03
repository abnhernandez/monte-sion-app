"use client"

import { useEffect, useRef, useState } from "react"
import { CalendarDays, MapPin, Clock } from "lucide-react"
import { openRouteToChurch } from "@/lib/rutas-client"

export function HeroSection() {
  const [visible, setVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const sectionRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.2 }
    )

    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const handleGetDirections = async () => {
    try {
      setIsLoading(true)
      await openRouteToChurch()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="relative overflow-hidden py-24 md:py-36 bg-[#14090c] text-white">
      
      {/* 🔥 Partículas fuego suaves */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] bg-amber-500/10 blur-[140px] animate-pulse top-[-150px] left-[-150px]" />
        <div className="absolute w-[500px] h-[500px] bg-red-700/10 blur-[120px] bottom-[-120px] right-[-120px]" />
      </div>

      {/* 💥 Luz dorada sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 via-transparent to-transparent animate-[pulse_6s_infinite]" />

      <div
        ref={sectionRef}
        className="relative mx-auto max-w-5xl px-6 text-center"
      >

        {/* OVERLINE */}
        <p className={`text-xs uppercase tracking-[0.5em] text-amber-400 transition-all duration-1000
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          CULTO UNIDO · AVIVAMIENTO · TESTIMONIO
        </p>

        {/* TÍTULO ÉPICO */}
        <h1
          className={`mt-8 font-serif text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05]
          transition-all duration-1000 delay-200
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <span className="block">
            BUSCAD PRIMERO
          </span>

          <span className="mt-4 block text-amber-400 animate-glow">
            EL REINO DE DIOS
          </span>
        </h1>

        {/* COPY MÁS PROFUNDO */}
        <p
          className={`mt-10 mx-auto max-w-2xl text-lg md:text-xl text-gray-200 leading-relaxed
          transition-all duration-1000 delay-300
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          No será un evento más.
          Será un antes y un después.

          Un llamado urgente a poner a Dios en el centro.
          Un tiempo donde la fe será probada,
          pero también fortalecida.

          Invitado especial <strong>Mauro Cervantes Pérez</strong>,
          compartiendo un testimonio real de fe en medio del fuego.
        </p>

        {/* INFO */}
        <div
          className={`mt-14 flex flex-wrap justify-center gap-4
          transition-all duration-1000 delay-500
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <InfoPill icon={<CalendarDays />} text="15 de marzo" />
          <InfoPill icon={<Clock />} text="11:00 A.M." />
          <InfoPill icon={<MapPin />} text="Iglesia Cristiana Monte Sion · Oaxaca" />
        </div>

        {/* 🔥 NUEVOS CTA DE CONVERSIÓN */}
        <div
          className={`mt-16 flex flex-col sm:flex-row justify-center gap-5
          transition-all duration-1000 delay-700
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
            {/* <a
            href="https://wa.me/529512091644?text=*Confirmo%20asistencia%20al%20Culto%20Unido*%20-%20BUSCAD%20PRIMERO%20EL%20REINO%20DE%20DIOS.%20En%20Iglesia%20Cristiana%20Monte%20Sion%2C%20Oaxaca.%2015%20de%20marzo%20a%20las%2011%3A00%20A.M."
            target="_blank"
            className="group inline-flex items-center justify-center gap-2 
            rounded-full bg-amber-400 px-10 py-5 text-lg font-semibold 
            text-black transition-all duration-300 hover:scale-105"
            >
            Confirmar asistencia
            </a> */}

          <button
            onClick={handleGetDirections}
            disabled={isLoading}
            className="rounded-full border border-amber-400 px-12 py-5 text-lg
            font-medium text-amber-400 transition-all duration-300
            hover:bg-amber-400 hover:text-black"
          >
            {isLoading ? "Cargando..." : "Cómo llegar"}
          </button>
        </div>

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
      border border-amber-400/30 bg-white/5 backdrop-blur-md
      px-6 py-3 text-sm text-gray-200">
      <span className="text-amber-400">{icon}</span>
      <span>{text}</span>
    </div>
  )
}