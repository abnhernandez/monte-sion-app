// components/Hero.tsx
export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-gradient-to-b from-night via-forest to-night">
      
      <div className="border border-gold text-gold text-xs tracking-[3px] px-5 py-2 rounded-full mb-6">
        🌲 Campamento Cristiano · 2026
      </div>

      <h1 className="font-bebas text-[clamp(72px,16vw,160px)] leading-[0.9]">
        Leche&Miel
        <span className="block text-amber italic text-[clamp(28px,6vw,60px)] font-serif">
          Manifiéstate
        </span>
      </h1>

      <div className="flex gap-6 mt-6 flex-wrap justify-center text-mist text-sm">
        <span>📅 12 de Abril de 2026</span>
        <span>📍 Oaxaca</span>
        <span>⏳ 1 día</span>
      </div>

      <a
        href="#registro"
        className="mt-10 bg-gradient-to-r from-gold to-amber text-night font-bold px-10 py-4 rounded-full shadow-lg hover:scale-105 transition"
      >
        ¡Quiero inscribirme!
      </a>
    </section>
  )
}