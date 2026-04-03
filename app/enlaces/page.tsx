import type { Metadata } from "next"
import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Facebook,
  HeartHandshake,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Users,
  Youtube,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Enlaces | Monte Sion Oaxaca",
  description:
    "Accesos rapidos a WhatsApp, eventos, redes sociales, avisos y recursos de Monte Sion Oaxaca.",
}

const WHATSAPP_HREF =
  "https://wa.me/529512091644?text=Hola.%20Vengo%20desde%20la%20pagina%20de%20enlaces%20y%20quiero%20informacion."

const GOOGLE_MAPS_HREF =
  "https://www.google.com/maps/search/?api=1&query=17.077605,-96.762161"

type LinkCard = {
  title: string
  description: string
  href: string
  icon: LucideIcon
  external?: boolean
}

const QUICK_ACTIONS: LinkCard[] = [
  {
    title: "WhatsApp",
    description: "Escribe y recibe respuesta directa.",
    href: WHATSAPP_HREF,
    icon: MessageCircle,
    external: true,
  },
  {
    title: "Eventos",
    description: "Consulta el calendario de actividades.",
    href: "/eventos",
    icon: CalendarDays,
  },
  {
    title: "Ubicacion",
    description: "Abre la ruta en Google Maps.",
    href: GOOGLE_MAPS_HREF,
    icon: MapPin,
    external: true,
  },
]

const RESOURCE_LINKS: LinkCard[] = [
  {
    title: "Avisos",
    description: "Novedades y comunicados.",
    href: "/avisos",
    icon: MessageCircle,
  },
  {
    title: "Lecciones",
    description: "Aprendizaje biblico paso a paso.",
    href: "/lecciones",
    icon: BookOpen,
  },
  {
    title: "Biblia",
    description: "Lectura biblica en linea.",
    href: "/bible",
    icon: BookOpen,
  },
  {
    title: "Como orar",
    description: "Guia simple para orar.",
    href: "/orar",
    icon: HeartHandshake,
  },
  {
    title: "Crear cuenta",
    description: "Registra tu cuenta en minutos.",
    href: "/registro",
    icon: Users,
  },
  {
    title: "Iniciar sesion",
    description: "Accede a tu cuenta actual.",
    href: "/login",
    icon: Users,
  },
]

const SOCIAL_LINKS: LinkCard[] = [
  {
    title: "YouTube",
    description: "Predicaciones y contenido en video.",
    href: "https://www.youtube.com/@montesionoaxaca",
    icon: Youtube,
    external: true,
  },
  {
    title: "Instagram",
    description: "Noticias rapidas de la comunidad.",
    href: "https://www.instagram.com/montesionoaxaca",
    icon: Instagram,
    external: true,
  },
  {
    title: "Facebook",
    description: "Publicaciones y transmisiones.",
    href: "https://www.facebook.com/montesionoax",
    icon: Facebook,
    external: true,
  },
  {
    title: "Correo",
    description: "Contactanos por email.",
    href: "mailto:rootmontesion@gmail.com",
    icon: Mail,
    external: true,
  },
]

function SmartLink({
  href,
  external,
  className,
  children,
}: {
  href: string
  external?: boolean
  className: string
  children: ReactNode
}) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}

function BlockTitle({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-semibold text-foreground sm:text-2xl">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground sm:text-base">{description}</p>
    </div>
  )
}

function LinkGridCard({ item }: { item: LinkCard }) {
  const Icon = item.icon

  return (
    <SmartLink
      href={item.href}
      external={item.external}
      className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/35"
    >
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted/40 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-card-foreground">{item.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
        Abrir
        <ArrowUpRight className="h-4 w-4" />
      </span>
    </SmartLink>
  )
}

export default function EnlacesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-base font-semibold">M</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Monte Sion</p>
              <p className="text-xs text-muted-foreground">Enlaces oficiales</p>
            </div>
          </Link>

          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <MessageCircle className="h-4 w-4" />
            Contacto
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-8 sm:py-10">
        <section className="rounded-xl border border-border bg-card p-6 sm:p-8">
          <p className="text-sm font-medium text-primary">Acceso rapido</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
            Todo lo importante en un solo lugar
          </h1>
          <p className="mt-3 max-w-3xl text-base text-muted-foreground">
            Esta pagina reduce pasos: contacto, eventos, ubicacion, recursos y redes
            oficiales en una sola vista.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {QUICK_ACTIONS.map((item) => (
              <LinkGridCard key={item.title} item={item} />
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-2">
          <div>
            <BlockTitle
              title="Recursos"
              description="Accesos frecuentes para avanzar en la fe y usar la plataforma."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {RESOURCE_LINKS.map((item) => (
                <LinkGridCard key={item.title} item={item} />
              ))}
            </div>
          </div>

          <div>
            <BlockTitle
              title="Redes oficiales"
              description="Canales confirmados para seguir actualizaciones de la iglesia."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {SOCIAL_LINKS.map((item) => (
                <LinkGridCard key={item.title} item={item} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
