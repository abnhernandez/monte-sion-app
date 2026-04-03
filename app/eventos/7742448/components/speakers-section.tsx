"use client"

import { Flame } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

export function SpeakersSection() {
  return (
    <section
      id="invitado"
      className="relative overflow-hidden bg-[#14090c] py-28 md:py-40"
    >
      {/* Iluminación Reino (vino + dorado) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-[#7a1c2e]/20 blur-[120px]" />
        <div className="absolute -right-40 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-amber-400/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-6xl px-6">

        {/* Header */}
        <div className="mb-24 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <Flame className="size-4 text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-[0.45em] text-amber-400/80">
              Invitado Especial
            </span>
          </div>

          <h2 className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-white">
            Un Testimonio que
            <span className="block text-amber-400 mt-2">
              Despierta Fe
            </span>
          </h2>
        </div>

        {/* Layout */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true }}
          className="grid items-center gap-20 md:grid-cols-2"
        >

          {/* Imagen */}
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
            <Image
              src="/avatar.jpg"
              alt="Mauro Cervantes Pérez"
              width={1200}
              height={1600}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="h-[420px] w-full object-cover md:h-[560px]"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-black/20 to-transparent" />
          </div>

          {/* Contenido */}
          <div>

            <p className="mb-5 text-[11px] uppercase tracking-[0.4em] text-amber-400/80">
              Testimonio de Avivamiento
            </p>

            <h3 className="font-serif text-3xl md:text-5xl font-semibold leading-[1.1] tracking-tight text-white">
              Mauro Cervantes Pérez
            </h3>

            <div className="mt-8 h-[2px] w-16 bg-amber-400/70" />

            <p className="mt-10 max-w-lg text-base md:text-lg leading-relaxed text-white/75">
              Una historia real de fe en medio del fuego.
              Cuando sus casas fueron quemadas, lo que parecía pérdida
              se convirtió en un escenario para que Dios mostrara Su poder.
              <br /><br />
              Este no es solo un relato — es una evidencia viva
              de que cuando buscamos primero el Reino,
              Dios responde con fidelidad.
              <br /><br />
              Prepárate para escuchar un testimonio que confronta,
              despierta y fortalece tu fe.
            </p>

          </div>
        </motion.div>
      </div>
    </section>
  )
}