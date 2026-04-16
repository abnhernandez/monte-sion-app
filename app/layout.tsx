import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Geist_Mono, Source_Serif_4 } from "next/font/google"
import Script from "next/script"
import { Analytics } from "@vercel/analytics/next"
import Providers from "./providers"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://montesion.me"),
  title: "Monte Sion Oaxaca | Iglesia Cristiana",
  description:
    "Bienvenido a casa. Iglesia Cristiana en Santa María Atzompa, Oaxaca.",
  keywords: [
    "iglesia",
    "comunidad cristiana",
    "lecciones bíblicas",
    "peticiones de oración",
    "avisos",
    "supabase",
  ],
  authors: [{ name: "Monte Sion Team" }],
  openGraph: {
    title: "Monte Sion Oaxaca | Iglesia Cristiana",
    description:
      "Plataforma web para comunidad cristiana con estudio, oración, avisos y administración.",
    url: "https://montesion.me",
    siteName: "Monte Sion Oaxaca",
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Monte Sion Oaxaca | Iglesia Cristiana",
    description:
      "Plataforma web para comunidad cristiana con estudio, oración, avisos y administración.",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#090d14" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${geistMono.variable} ${sourceSerif.variable}`} suppressHydrationWarning>
      <body className="min-h-screen font-sans">
        <Script id="system-theme" strategy="beforeInteractive">
          {`(() => {
            const root = document.documentElement;
            const media = window.matchMedia("(prefers-color-scheme: dark)");
            const applyTheme = () => root.classList.toggle("dark", media.matches);
            applyTheme();
            if (typeof media.addEventListener === "function") {
              media.addEventListener("change", applyTheme);
            } else if (typeof media.addListener === "function") {
              media.addListener(applyTheme);
            }
          })();`}
        </Script>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}