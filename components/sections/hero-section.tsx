import Link from "next/link"
import { Calendar, Clock, HeartHandshake, MapPin } from "lucide-react"
import { getHeroCtas } from "@/lib/hero-ctas-actions"
import { getHeroSchedule, getHeroSettings } from "@/lib/hero-actions"

export async function HeroSection() {
  const [settings, schedule, ctas] = await Promise.all([
    getHeroSettings(),
    getHeroSchedule(),
    getHeroCtas(),
  ])

  const ctaIconMap = {
    heart: HeartHandshake,
    map: MapPin,
    calendar: Calendar,
  }

  return (
    <section
      id="inicio"
      className="relative overflow-hidden"
      aria-labelledby="titulo-inicio"
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/50"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-16 sm:py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:items-center lg:gap-16">
          {/* Content */}
          <div className="max-w-2xl space-y-6">
            {/* Badge */}
            {settings?.badge_label ? (
              <Link
                href={settings.badge_href}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 transition-colors hover:bg-muted"
              >
                <span className="flex h-2 w-2 rounded-full bg-accent" />
                <span className="text-sm font-medium text-muted-foreground">
                  {settings.badge_label}
                </span>
              </Link>
            ) : null}

            {/* Headline */}
            <h1
              id="titulo-inicio"
              className="font-serif text-4xl font-normal tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance"
            >
              Bienvenido a casa
            </h1>

            {/* Subheadline */}
            <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Un lugar para crecer en la fe, recibir apoyo y vivir la Palabra
              con propósito. Únete a nuestra comunidad.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 pt-2">
              {ctas.map((cta) => {
                const Icon = ctaIconMap[cta.icon] ?? HeartHandshake
                const isPrimary = cta.variant === "primary"
                return (
                  <Link
                    key={cta.id}
                    href={cta.href}
                    className={
                      isPrimary
                        ? "inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
                        : "inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                    }
                  >
                    <Icon className="h-5 w-5" />
                    {cta.label}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Schedule Cards */}
          <div id="horarios" className="space-y-4">
            {schedule.map((item) => {
              const displayLocation = item.location?.startsWith("/")
                ? null
                : item.location

              return item.href ? (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block w-full rounded-xl border border-border bg-card p-5 transition-all hover:border-accent/30 hover:shadow-md"
                >
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1.5 flex items-center gap-2 text-xl font-semibold text-card-foreground">
                    <Clock className="h-5 w-5 text-accent" />
                    {item.time}
                  </p>
                  {displayLocation && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {displayLocation}
                    </p>
                  )}
                </Link>
              ) : (
                <article
                  key={item.label}
                  className="w-full rounded-xl border border-border bg-card p-5 transition-all hover:border-accent/30 hover:shadow-md"
                >
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1.5 flex items-center gap-2 text-xl font-semibold text-card-foreground">
                    <Clock className="h-5 w-5 text-accent" />
                    {item.time}
                  </p>
                  {displayLocation && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {displayLocation}
                    </p>
                  )}
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
