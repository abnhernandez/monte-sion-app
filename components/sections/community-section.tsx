import Link from "next/link"
import { MessageCircle, ArrowRight } from "lucide-react"
import { getCommunityGroups } from "@/lib/community-actions"

export async function CommunitySection() {
  const groups = await getCommunityGroups()

  return (
    <section
      id="comunidad"
      className="mx-auto w-full max-w-6xl px-6 py-16"
      aria-labelledby="titulo-comunidad"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="titulo-comunidad"
            className="font-serif text-3xl font-normal text-foreground sm:text-4xl"
          >
            Comunidad en WhatsApp
          </h2>
          <p className="mt-3 text-muted-foreground">
            Únete al grupo que mejor se adapte a ti
          </p>
        </div>
        <Link
          href="/comunidad"
          className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent/80"
        >
          Ver todos los grupos
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {groups.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
          Aún no hay grupos publicados.
        </div>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {groups.map((group) => (
            <a
              key={group.id}
              href={group.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex items-start gap-4 rounded-xl border p-5 transition-all hover:shadow-md ${
                group.highlight
                  ? "border-accent/30 bg-accent/5 hover:border-accent/50"
                  : "border-border bg-card hover:border-accent/30"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  group.highlight
                    ? "bg-accent/20 text-accent"
                    : "bg-muted text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent"
                }`}
              >
                <MessageCircle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-card-foreground">
                  {group.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {group.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  )
}
