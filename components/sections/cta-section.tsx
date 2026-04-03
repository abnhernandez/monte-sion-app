import Link from "next/link"
import { ArrowRight, HeartHandshake } from "lucide-react"
import { getCtaSettings } from "@/lib/cta-actions"

export async function CtaSection() {
  const settings = await getCtaSettings()

  if (!settings) return null

  const Icon = settings.icon === "arrow" ? ArrowRight : HeartHandshake

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="relative overflow-hidden rounded-2xl bg-primary p-8 sm:p-12 lg:p-16">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5" aria-hidden="true">
          <svg className="h-full w-full" viewBox="0 0 100 100">
            <defs>
              <pattern
                id="cta-pattern"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="1" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#cta-pattern)" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/10">
            <Icon className="h-7 w-7 text-primary-foreground" />
          </div>

          <h2 className="font-serif text-2xl font-normal text-primary-foreground sm:text-3xl lg:text-4xl text-balance">
            {settings.title}
          </h2>

          <p className="mt-4 text-primary-foreground/80">
            {settings.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={settings.primary_href}
              className="inline-flex items-center gap-2 rounded-full bg-primary-foreground px-6 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary-foreground/90 hover:shadow-lg"
            >
              {settings.primary_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={settings.secondary_href}
              target={settings.secondary_external ? "_blank" : undefined}
              rel={settings.secondary_external ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            >
              {settings.secondary_label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
