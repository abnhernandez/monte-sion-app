import type { Metadata } from "next"
import { DM_Serif_Display } from "next/font/google"
import { Navbar } from "./components/navbar"
import { HeroSection } from "./components/hero-section"
import { SpeakersSection } from "./components/speakers-section"
import AgendaSection from "./components/agenda-section"
import { LocationSection } from "./components/location-section"
import { Footer } from "./components/footer"
import styles from "./theme.module.css"

const eventSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-event-serif",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Las decisiones más importantes de tu vida",
  description:
    "CADA DECISIÓN DEFINE TU FUTURO. Evento juvenil cristiano en Oaxaca. Sábado 28 de febrero, 6:00 PM. Iglesia Cristiana Monte Sion.",
  openGraph: {
    title: "Las decisiones más importantes de tu vida",
    description:
      "CADA DECISIÓN DEFINE TU FUTURO. Evento juvenil cristiano en Oaxaca.",
    url: "https://montesion.me/eventos/7742347",
    images: ["/og-image"],
  },
}

export default function Page() {
  return (
    <div className={`${styles.eventTheme} ${eventSerif.variable}`}>
      <Navbar />
      <main>
        <HeroSection />
        <SpeakersSection />
        <AgendaSection />
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
            name: "Las decisiones más importantes de tu vida",
            startDate: "2026-02-28T18:00:00-06:00",
            eventAttendanceMode:
              "https://schema.org/OfflineEventAttendanceMode",
            eventStatus: "https://schema.org/EventScheduled",
            location: {
              "@type": "Place",
              name: "Iglesia Cristiana Monte Sion",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Santa María Atzompa",
                addressRegion: "Oaxaca",
                addressCountry: "MX",
              },
            },
            image: ["https://montesion.me/og-image"],
            description:
              "Evento juvenil cristiano diseñado para fortalecer tu fe y ayudarte a tomar decisiones con propósito.",
            organizer: {
              "@type": "Organization",
              name: "Iglesia Cristiana Monte Sion",
              url: "https://montesion.me",
            },
          }),
        }}
      />
    </div>
  )
}