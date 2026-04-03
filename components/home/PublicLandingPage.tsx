import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Users,
  Baby,
  Heart,
} from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { RouteToChurch } from "@/components/route-to-church"
import { FaqAccordion } from "@/components/sections/faq-accordion"
import { getFaqs } from "@/lib/faq-actions"
import { getHeroCtas } from "@/lib/hero-ctas-actions"
import { getHeroSchedule, getHeroSettings } from "@/lib/hero-actions"
import { getLocation } from "@/lib/location-actions"
import { getMinistries } from "@/lib/ministries-actions"

const CTA_ICONS = {
  heart: HeartHandshake,
  map: MapPin,
  calendar: CalendarDays,
} as const

const MINISTRY_ICONS = {
  users: Users,
  heart: Heart,
  baby: Baby,
} as const

const DEFAULT_ACTIONS = [
  {
    id: "default-calendar",
    label: "Ver horarios",
    href: "#horarios",
    variant: "primary" as const,
    icon: "calendar" as const,
  },
  {
    id: "default-map",
    label: "Cómo llegar",
    href: "#visitanos",
    variant: "ghost" as const,
    icon: "map" as const,
  },
]

function LandingSection({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string
  eyebrow: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="mx-auto w-full max-w-6xl px-6 py-14 sm:py-16">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold text-primary">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-foreground sm:text-3xl">
          {title}
        </h2>
        <p className="mt-4 text-base text-muted-foreground sm:text-lg">
          {description}
        </p>
      </div>
      <div className="mt-10">{children}</div>
    </section>
  )
}

export default async function PublicLandingPage() {
  const [settings, schedule, ctas, ministries, faqs, location] = await Promise.all([
    getHeroSettings(),
    getHeroSchedule(),
    getHeroCtas(),
    getMinistries(),
    getFaqs(),
    getLocation(),
  ])

  const heroActions = ctas.length > 0 ? ctas : DEFAULT_ACTIONS
  const featuredSchedule = schedule.slice(0, 2)
  const featuredMinistries = ministries.slice(0, 3)
  const featuredFaqs = faqs.slice(0, 4)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main id="contenido">
        <section
          id="inicio"
          className="relative overflow-hidden border-b border-border/60"
          aria-labelledby="landing-title"
        >
          <div className="absolute inset-0 bg-muted/20" aria-hidden="true" />

          <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-6 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-24">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary">
                <Sparkles className="h-4 w-4" />
                {settings?.badge_label ? (
                  <Link href={settings.badge_href} className="font-medium hover:opacity-80">
                    {settings.badge_label}
                  </Link>
                ) : (
                  <span className="font-medium">Bienvenido a Monte Sion</span>
                )}
              </div>

              <h1
                id="landing-title"
                className="mt-6 text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-6xl"
              >
                Nos alegra que
                <br />
                estés aquí
              </h1>

              <p className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl">
                Si es tu primera vez, queremos ponértelo fácil: puedes venir tal como
                estás, conocer a la iglesia con calma y encontrar un lugar donde crecer
                en la fe acompañado.
              </p>

              <div className="mt-6 grid gap-2 sm:grid-cols-3">
                {[
                  "1. Revisa horarios",
                  "2. Ubica la dirección",
                  "3. Escríbenos si necesitas ayuda",
                ].map((item) => (
                  <p key={item} className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
                    {item}
                  </p>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {heroActions.map((action) => {
                  const Icon = CTA_ICONS[action.icon] ?? HeartHandshake
                  const isPrimary = action.variant === "primary"

                  return (
                    <Link
                      key={action.id}
                      href={action.href}
                      className={
                        isPrimary
                          ? "inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:translate-y-[-1px] hover:bg-primary/90"
                          : "inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition hover:border-primary/25 hover:bg-secondary"
                      }
                    >
                      <Icon className="h-4 w-4" />
                      {action.label}
                    </Link>
                  )
                })}

                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition hover:border-primary/25 hover:bg-secondary"
                >
                  Entrar
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-sm font-semibold text-foreground">Ven como estás</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    No necesitas saberte todo para acercarte a Dios.
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-sm font-semibold text-foreground">Te recibimos con calma</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Siempre puedes preguntar y habrá quien te ayude a ubicarte.
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-sm font-semibold text-foreground">Hay lugar para tu familia</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    También pensamos en niños, jóvenes y nuevos amigos.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-2 text-primary">
                  <HeartHandshake className="h-5 w-5" />
                  <p className="text-sm font-semibold">
                    Tu primera visita
                  </p>
                </div>

                <div className="mt-5 space-y-4">
                  {[
                    "No necesitas registrarte para venir por primera vez.",
                    "Si llegas unos minutos antes, alguien puede orientarte.",
                    "Si vienes con niños o jóvenes, también hay espacio para ellos.",
                  ].map((item) => (
                    <div key={item} className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <p className="text-sm text-foreground/85">{item}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-border bg-background/70 p-4">
                  <p className="text-xs font-semibold text-primary">
                    ¿Necesitas ayuda antes de venir?
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Puedes escribirnos y con gusto te acompañamos.
                  </p>
                  <a
                    href="https://wa.me/529512091644?text=Hola.%20Es%20mi%20primera%20vez%20y%20quiero%20informaci%C3%B3n."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/25 hover:bg-secondary"
                  >
                    <MessageCircle className="h-4 w-4 text-primary" />
                    Escribir por WhatsApp
                  </a>
                </div>
              </div>

              <div id="horarios" className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-2 text-primary">
                  <Clock3 className="h-5 w-5" />
                  <p className="text-sm font-semibold">
                    Horarios para empezar
                  </p>
                </div>

                <div className="mt-5 space-y-3">
                  {featuredSchedule.length > 0 ? (
                    featuredSchedule.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-border bg-background/70 p-4"
                      >
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                          {item.label}
                        </p>
                        <p className="mt-2 text-lg font-semibold text-foreground">
                          {item.time}
                        </p>
                        {item.location ? (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {item.location}
                          </p>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                      Todavía no hay horarios publicados.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <LandingSection
          id="nuevos"
          eyebrow="Si Es Tu Primera Vez"
          title="Queremos que llegues con paz, no con presión"
          description="La idea no es impresionarte, sino ayudarte a dar un primer paso sencillo y honesto. Aquí tienes una guía rápida para saber qué esperar."
        >
          <div className="grid gap-5 lg:grid-cols-3">
            {[
              {
                number: "01",
                title: "Llegas y te ubicas",
                text: "Puedes venir solo, con amigos o en familia. Si necesitas ayuda, pregunta con confianza.",
              },
              {
                number: "02",
                title: "Participas a tu ritmo",
                text: "Habrá alabanza, enseñanza bíblica y tiempo de oración. Nadie te va a forzar a hacer algo.",
              },
              {
                number: "03",
                title: "Sigues conectado",
                text: "Si te gusta, puedes volver, conocer ministerios o escribirnos para caminar contigo.",
              },
            ].map((step) => (
              <article
                key={step.number}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <p className="text-sm font-semibold text-primary">
                  {step.number}
                </p>
                <h3 className="mt-4 text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{step.text}</p>
              </article>
            ))}
          </div>
        </LandingSection>

        <LandingSection
          id="acompanamiento"
          eyebrow="Lo Que Encontrarás"
          title="Una iglesia para caminar acompañado"
          description="Más que una reunión, queremos ser una casa espiritual donde puedas aprender, sanar, servir y crecer cerca de Jesús."
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: "Palabra con propósito",
                text: "Enseñanza bíblica clara y aterrizada a la vida diaria.",
                icon: BookOpen,
              },
              {
                title: "Oración y apoyo",
                text: "Espacio para pedir ayuda, orar juntos y no caminar solo.",
                icon: ShieldCheck,
              },
              {
                title: "Comunidad real",
                text: "Relaciones sanas, amistad y gente que sí se interesa por ti.",
                icon: Users,
              },
              {
                title: "Paso a paso",
                text: "No importa en qué punto estés; puedes empezar hoy mismo.",
                icon: Sparkles,
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="inline-flex rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
              </article>
            ))}
          </div>
        </LandingSection>

        <section id="ministerios" className="mx-auto w-full max-w-6xl px-6 py-10 sm:py-12">
          <details className="rounded-2xl border border-border bg-card p-5">
            <summary className="cursor-pointer list-none text-sm font-semibold text-foreground">
              Ver ministerios y espacios de crecimiento
            </summary>
            <p className="mt-2 text-sm text-muted-foreground">
              Si decides quedarte, puedes conectar con áreas pensadas para servir y crecer con otros.
            </p>

            <div className="mt-5">
              {featuredMinistries.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
                  Aún no hay ministerios publicados.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {featuredMinistries.map((ministry) => {
                    const Icon =
                      MINISTRY_ICONS[ministry.icon as keyof typeof MINISTRY_ICONS] ?? Users

                    return (
                      <article
                        key={ministry.id}
                        className="rounded-2xl border border-border bg-background p-5"
                      >
                        <div className="inline-flex rounded-xl border border-primary/20 bg-primary/10 p-2 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <h3 className="mt-3 text-base font-semibold text-foreground">
                          {ministry.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {ministry.description}
                        </p>
                      </article>
                    )
                  })}
                </div>
              )}
            </div>
          </details>
        </section>

        <LandingSection
          id="visitanos"
          eyebrow="Ubicación"
          title="Te esperamos en Monte Sion"
          description="Si quieres visitarnos, aquí tienes la dirección y una forma rápida de abrir la ruta. Si te da paz, también puedes escribirnos antes de venir."
        >
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <div className="rounded-2xl border border-border bg-card p-6">
              {location ? (
                <>
                  <h3 className="text-2xl font-semibold text-foreground">
                    {location.title}
                  </h3>
                  <div className="mt-5 space-y-3">
                    <div className="flex gap-3">
                      <MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {location.address_line1}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {location.address_line2}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">{location.city}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <RouteToChurch />
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                  Aún no hay información de ubicación publicada.
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Para tu primera visita
                </p>
                <div className="mt-5 space-y-4">
                  {[
                    "Puedes llegar unos 10 o 15 minutos antes si quieres ubicarte tranquilo.",
                    "Si no conoces a nadie, escríbenos y te ayudamos a llegar con más confianza.",
                    "Si algo te da nervio, no pasa nada. Nos da gusto recibir gente nueva.",
                  ].map((item) => (
                    <div key={item} className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <p className="text-sm text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Contacto rápido
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  <a
                    href="https://wa.me/529512091644?text=Hola.%20Quiero%20conocer%20Monte%20Sion."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-between rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm font-medium text-foreground transition hover:border-primary/25 hover:bg-background"
                  >
                    WhatsApp
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </a>
                  <Link
                    href="/avisos"
                    className="inline-flex items-center justify-between rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm font-medium text-foreground transition hover:border-primary/25 hover:bg-background"
                  >
                    Avisos y novedades
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </LandingSection>

        <section id="faq" className="mx-auto w-full max-w-6xl px-6 py-10 sm:py-12">
          <details className="rounded-2xl border border-border bg-card p-5" open>
            <summary className="cursor-pointer list-none text-sm font-semibold text-foreground">
              Preguntas frecuentes antes de visitar
            </summary>
            <p className="mt-2 text-sm text-muted-foreground">
              Respuestas cortas para que tomes una decisión con tranquilidad.
            </p>

            <div className="mt-5">
              {featuredFaqs.length > 0 ? (
                <FaqAccordion items={featuredFaqs} />
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
                  Aún no hay preguntas publicadas.
                </div>
              )}
            </div>
          </details>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 pb-20">
          <div className="rounded-2xl border border-border bg-card p-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold text-primary">
                  También Para Los De Casa
                </p>
                <h2 className="mt-4 font-serif text-3xl font-normal text-foreground sm:text-4xl">
                  ¿Ya eres parte de Monte Sion?
                </h2>
                <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                  Si ya caminas con nosotros, puedes entrar a tu cuenta, ver recursos y
                  mantenerte conectado con lo que está pasando en la iglesia.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  Entrar
                </Link>
                <Link
                  href="/registro"
                  className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition hover:border-primary/25 hover:bg-secondary"
                >
                  Crear cuenta
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
