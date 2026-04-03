import { Users, Heart, Baby } from "lucide-react"
import { getMinistries } from "@/lib/ministries-actions"

const ICONS = {
  users: Users,
  heart: Heart,
  baby: Baby,
} as const

export async function MinistriesSection() {
  const ministries = await getMinistries()

  return (
    <section
      id="ministerios"
      className="mx-auto w-full max-w-6xl px-6 py-16"
      aria-labelledby="titulo-ministerios"
    >
      <div>
        <h2
          id="titulo-ministerios"
          className="font-serif text-3xl font-normal text-foreground sm:text-4xl"
        >
          Ministerios
        </h2>
        <p className="mt-3 text-muted-foreground">
          Espacios para crecer, servir y conectar
        </p>
      </div>

      {ministries.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
          Aún no hay ministerios publicados.
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ministries.map((ministry) => {
            const Icon = ICONS[ministry.icon as keyof typeof ICONS] ?? Users
            return (
              <article
                key={ministry.id}
                className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-accent/30 hover:shadow-md"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors group-hover:bg-accent/10 group-hover:text-accent">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-card-foreground">
                  {ministry.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {ministry.description}
                </p>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}