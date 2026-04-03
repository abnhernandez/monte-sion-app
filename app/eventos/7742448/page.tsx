import type { Metadata } from "next"
import { Navbar } from "./components/navbar"
import { HeroSection } from "./components/hero-section"
import { SpeakersSection } from "./components/speakers-section"
import { LocationSection } from "./components/location-section"
import { Footer } from "./components/footer"

export const metadata: Metadata = {
  title: "Buscad Primero el Reino de Dios | Culto Unido en Oaxaca",
  description:
    "BUSCAD PRIMERO EL REINO DE DIOS. Culto Unido de Avivamiento con el invitado especial Mauro Cervantes Pérez. 15 de marzo, 11:00 AM. Iglesia Cristiana Monte Sion, Oaxaca.",
  keywords: [
    "Buscad primero el Reino de Dios",
    "Culto Unido Oaxaca",
    "Avivamiento en Oaxaca",
    "Mauro Cervantes Pérez",
    "Testimonio cristiano",
    "Iglesia Cristiana Monte Sion",
    "Evento cristiano Oaxaca",
    "Iglesia en Santa María Atzompa"
  ],
  openGraph: {
    title: "Buscad Primero el Reino de Dios | Culto Unido",
    description:
      "Culto Unido de Avivamiento este 15 de marzo a las 11:00 AM. Invitado especial: Mauro Cervantes Pérez compartiendo testimonio impactante.",
    url: "https://montesion.me/eventos/buscad-primero-el-reino-de-dios",
    siteName: "Iglesia Cristiana Monte Sion",
    images: [
      {
        url: "https://montesion.me/og-image",
        width: 1200,
        height: 630,
        alt: "Buscad Primero el Reino de Dios - Culto Unido"
      }
    ],
    locale: "es_MX",
    type: "website",
  },
}

export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <SpeakersSection />
        <LocationSection />
      </main>
      <Footer />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            name: "Buscad Primero el Reino de Dios - Culto Unido",
            startDate: "2026-03-15T11:00:00-06:00",
            endDate: "2026-03-15T17:00:00-06:00",
            eventAttendanceMode:
              "https://schema.org/OfflineEventAttendanceMode",
            eventStatus: "https://schema.org/EventScheduled",
            description:
              "Culto Unido de Avivamiento bajo el lema BUSCAD PRIMERO EL REINO DE DIOS. Invitado especial Mauro Cervantes Pérez, quien compartirá testimonio de cómo les quemaron sus casas.",
            location: {
              "@type": "Place",
              name: "Iglesia Cristiana Monte Sion",
              address: {
                "@type": "PostalAddress",
                streetAddress:
                  "Cuicatlán 184, Colonia Niños Héroes",
                addressLocality: "Santa María Atzompa",
                postalCode: "71222",
                addressRegion: "Oaxaca",
                addressCountry: "MX",
              },
            },
            image: [
              "https://montesion.me/og-image"
            ],
            organizer: {
              "@type": "Organization",
              name: "Iglesia Cristiana Monte Sion",
              url: "https://montesion.me",
            },
            performer: {
              "@type": "Person",
              name: "Mauro Cervantes Pérez",
            },
          }),
        }}
      />
    </>
  )
}