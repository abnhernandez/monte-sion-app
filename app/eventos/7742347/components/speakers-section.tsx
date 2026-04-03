"use client"

import { Users } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

export function SpeakersSection() {
  return (
    <section
      id="invitados"
      className="relative overflow-hidden bg-[#071a14] py-28 md:py-40"
    >
      {/* Iluminación lateral */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute -right-40 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-amber-400/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-6xl px-6">

        {/* Header */}
        <div className="mb-24 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <Users className="size-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-[0.45em] text-primary/80">
              Matrimonio Invitado
            </span>
          </div>

          {/* 🔥 Fire Animated Title */}
          <h2 className="font-serif text-4xl md:text-6xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-500 to-red-500 animate-fire">
            Voces que marcarán tu historia
          </h2>
        </div>

        {/* Layout */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          viewport={{ once: true }}
          className="grid items-center gap-20 md:grid-cols-2"
        >

          {/* Imagen */}
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
            <Image
              src="/avatar.svg"
              alt="Erick Guzmán Cruz & Noemí Trujillo Rogel"
              width={1200}
              height={1600}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="h-[420px] w-full object-cover md:h-[540px]"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-black/20 to-transparent" />
          </div>

          {/* Contenido */}
          <div>

            <p className="mb-5 text-[11px] uppercase tracking-[0.4em] text-primary/80">
              Matrimonio Invitado
            </p>

            <h3 className="font-serif text-3xl md:text-5xl font-semibold leading-[1.1] tracking-tight text-white">
              Erick Guzmán Cruz{" "}
              <br className="hidden md:block" />
              <motion.span
                initial={{ opacity: 0, scale: 0.6 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="inline-block text-primary mx-2"
              >
                &
              </motion.span>
              Noemí Trujillo Rogel
            </h3>

            <div className="mt-8 h-[2px] w-16 bg-primary/60" />

            <p className="mt-10 max-w-lg text-base leading-relaxed text-white/75">
              Un matrimonio que compartirá un testimonio que ha impactado a muchos.
              Una historia real que demuestra que cuando Dios toma el control,
              la vida cambia de dirección y el propósito se vuelve claro.
              <br /><br />
              No es teoría, no es motivación pasajera — es evidencia del poder
              de Dios obrando en lo cotidiano, en las decisiones, en la fe perseverante.
              <br /><br />
              “Si alguno está en Cristo, nueva criatura es” (2 Corintios 5:17).
              “Fiel es el que os llama, el cual también lo hará”
              (1 Tesalonicenses 5:24).
            </p>

          </div>
        </motion.div>
      </div>
    </section>
  )
}